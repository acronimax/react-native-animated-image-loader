#import "AnimatedImageLoaderView.h"
#import "AnimatedImageLoaderCore.h"
#import "AnimatedImageLoaderShimmerView.h"

#import <react/renderer/components/AnimatedImageLoaderSpec/ComponentDescriptors.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/EventEmitters.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/Props.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;
using facebook::react::animatedimageloader::AnimatedImageLoaderCore;

namespace {

// Placeholders are decoded small and stretched to fill — this is the
// standard Blurhash/ThumbHash usage pattern (a tiny decode upscaled with
// bilinear filtering gives the characteristic smooth blur) and also doubles
// as the dominant-color sample buffer.
constexpr int kPlaceholderDecodeSize = 32;

UIImage *_Nullable UIImageFromRGBA8888Base64(const std::string &base64, int width, int height)
{
  if (base64.empty()) {
    return nil;
  }

  NSData *data = [[NSData alloc] initWithBase64EncodedString:[NSString stringWithUTF8String:base64.c_str()]
                                                       options:0];
  if (data.length != (NSUInteger)(width * height * 4)) {
    return nil;
  }

  CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
  CGDataProviderRef provider = CGDataProviderCreateWithCFData((__bridge CFDataRef)data);
  CGImageRef cgImage = CGImageCreate(
      (size_t)width,
      (size_t)height,
      8,
      32,
      (size_t)width * 4,
      colorSpace,
      kCGBitmapByteOrderDefault | kCGImageAlphaLast,
      provider,
      NULL,
      false,
      kCGRenderingIntentDefault);
  CGColorSpaceRelease(colorSpace);
  CGDataProviderRelease(provider);

  if (!cgImage) {
    return nil;
  }

  UIImage *image = [UIImage imageWithCGImage:cgImage];
  CGImageRelease(cgImage);
  return image;
}

} // namespace

@interface AnimatedImageLoaderView () <RCTAnimatedImageLoaderViewViewProtocol>

@end

@implementation AnimatedImageLoaderView {
  UIImageView *_placeholderImageView;
  UIImageView *_finalImageView;
  AnimatedImageLoaderShimmerView *_shimmerView;
  NSURLSessionDataTask *_imageTask;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<AnimatedImageLoaderViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const AnimatedImageLoaderViewProps>();
    _props = defaultProps;

    _placeholderImageView = [[UIImageView alloc] initWithFrame:self.bounds];
    _placeholderImageView.contentMode = UIViewContentModeScaleAspectFill;
    _placeholderImageView.clipsToBounds = YES;
    _placeholderImageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

    _finalImageView = [[UIImageView alloc] initWithFrame:self.bounds];
    _finalImageView.contentMode = UIViewContentModeScaleAspectFill;
    _finalImageView.clipsToBounds = YES;
    _finalImageView.alpha = 0;
    _finalImageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

    [self addSubview:_placeholderImageView];
    [self addSubview:_finalImageView];
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldConcreteProps = static_cast<const AnimatedImageLoaderViewProps &>(*_props);
  const auto &newConcreteProps = static_cast<const AnimatedImageLoaderViewProps &>(*props);

  bool typeChanged = newConcreteProps.placeholderType != oldConcreteProps.placeholderType;
  bool isShimmer = newConcreteProps.placeholderType == AnimatedImageLoaderViewPlaceholderType::ShimmerShader;

  if (isShimmer) {
    if (typeChanged) {
      [self _showShimmer];
    }
  } else {
    if (typeChanged) {
      [self _hideShimmer];
    }
    bool hashTypeChanged = newConcreteProps.placeholderHashType != oldConcreteProps.placeholderHashType;
    if (!newConcreteProps.placeholderHash.empty() &&
        (newConcreteProps.placeholderHash != oldConcreteProps.placeholderHash || typeChanged || hashTypeChanged)) {
      [self _decodeAndApplyPlaceholder:newConcreteProps.placeholderHash
                              hashType:[AnimatedImageLoaderView _resolveHashType:newConcreteProps]];
    }
  }

  NSString *newUri = [NSString stringWithUTF8String:newConcreteProps.source.uri.c_str()];
  NSString *oldUri = [NSString stringWithUTF8String:oldConcreteProps.source.uri.c_str()];
  if (newUri.length > 0 && ![newUri isEqualToString:oldUri]) {
    [self _loadFinalImage:newUri fadeDurationMs:newConcreteProps.fadeDuration];
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)_showShimmer
{
  if (!_shimmerView) {
    _shimmerView = [[AnimatedImageLoaderShimmerView alloc] initWithFrame:self.bounds];
    _shimmerView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self insertSubview:_shimmerView atIndex:0];
  }
  _shimmerView.hidden = NO;
  _shimmerView.paused = NO;
  _placeholderImageView.hidden = YES;
}

- (void)_hideShimmer
{
  _shimmerView.hidden = YES;
  _shimmerView.paused = YES;
  _placeholderImageView.hidden = NO;
}

// placeholderType doubles as the decode format only for 'blurhash'/
// 'thumbhash' — visual modes like 'dominant-color'/'pixelate' aren't hash
// formats at all, so passing them straight through as hashType (as this
// used to do) makes the decoder silently decode nothing. placeholderHashType
// is the actual format in that case, falling back to 'blurhash' if unset.
+ (std::string)_resolveHashType:(const AnimatedImageLoaderViewProps &)props
{
  if (!props.placeholderHashType.empty()) {
    return props.placeholderHashType;
  }
  std::string placeholderTypeStr = toString(props.placeholderType);
  if (placeholderTypeStr == "blurhash" || placeholderTypeStr == "thumbhash") {
    return placeholderTypeStr;
  }
  return "blurhash";
}

- (void)_decodeAndApplyPlaceholder:(const std::string &)hash hashType:(const std::string &)hashType
{
  __weak AnimatedImageLoaderView *weakSelf = self;

  // On the very first mount, Fabric calls updateEventEmitter: *after*
  // updateProps:oldProps:, so _eventEmitter can still be null here — read it
  // lazily once decoding has finished (by which time mounting is done)
  // rather than capturing it upfront.
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    std::string pixels = AnimatedImageLoaderCore::decodePlaceholderHash(
        hash, hashType, kPlaceholderDecodeSize, kPlaceholderDecodeSize);
    std::string color = AnimatedImageLoaderCore::extractDominantColor(pixels);
    UIImage *image = UIImageFromRGBA8888Base64(pixels, kPlaceholderDecodeSize, kPlaceholderDecodeSize);

    AnimatedImageLoaderView *strongSelf = weakSelf;
    if (strongSelf && strongSelf->_eventEmitter) {
      static_cast<const AnimatedImageLoaderViewEventEmitter &>(*strongSelf->_eventEmitter)
          .onPaletteExtracted({color});
    }

    dispatch_async(dispatch_get_main_queue(), ^{
      AnimatedImageLoaderView *strongSelfMain = weakSelf;
      if (strongSelfMain) {
        strongSelfMain->_placeholderImageView.image = image;
      }
    });
  });
}

- (void)_loadFinalImage:(NSString *)uri fadeDurationMs:(double)fadeDurationMs
{
  [_imageTask cancel];

  NSURL *url = [NSURL URLWithString:uri];
  if (!url) {
    return;
  }

  __weak AnimatedImageLoaderView *weakSelf = self;
  _imageTask = [[NSURLSession sharedSession]
      dataTaskWithURL:url
    completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
      if (error != nil || data.length == 0) {
        return;
      }
      UIImage *image = [UIImage imageWithData:data];
      if (!image) {
        return;
      }

      dispatch_async(dispatch_get_main_queue(), ^{
        AnimatedImageLoaderView *strongSelf = weakSelf;
        if (!strongSelf) {
          return;
        }
        strongSelf->_finalImageView.image = image;
        strongSelf->_finalImageView.alpha = 0;
        [UIView animateWithDuration:fadeDurationMs / 1000.0
                          animations:^{
                            strongSelf->_finalImageView.alpha = 1;
                          }];
      });
    }];
  [_imageTask resume];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];

  [_imageTask cancel];
  _imageTask = nil;
  _placeholderImageView.image = nil;
  _placeholderImageView.hidden = NO;
  _finalImageView.image = nil;
  _finalImageView.alpha = 0;
  _shimmerView.hidden = YES;
  _shimmerView.paused = YES;
}

- (void)dealloc
{
  [_imageTask cancel];
}

@end

Class<RCTComponentViewProtocol> AnimatedImageLoaderViewCls(void)
{
  return AnimatedImageLoaderView.class;
}
