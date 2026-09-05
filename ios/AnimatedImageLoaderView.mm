#import "AnimatedImageLoaderView.h"
#import "AnimatedImageLoaderCore.h"

#import <react/renderer/components/AnimatedImageLoaderSpec/ComponentDescriptors.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/EventEmitters.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/Props.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;
using facebook::react::animatedimageloader::AnimatedImageLoaderCore;

namespace {
// Sampling size for the placeholder decode feeding dominant-color
// extraction — this only needs enough pixels for a representative ambient
// color, not to render the placeholder itself (that lands in a later phase
// alongside the real crossfade rendering).
constexpr double kPaletteSampleSize = 8;
} // namespace

@interface AnimatedImageLoaderView () <RCTAnimatedImageLoaderViewViewProtocol>

@end

@implementation AnimatedImageLoaderView {
  UIView *_view;
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

    // Scaffolding only — no rendering logic yet (native crossfade/shimmer
    // compositing lands in a later phase).
    _view = [[UIView alloc] initWithFrame:self.bounds];
    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldConcreteProps = static_cast<const AnimatedImageLoaderViewProps &>(*_props);
  const auto &newConcreteProps = static_cast<const AnimatedImageLoaderViewProps &>(*props);

  if (!newConcreteProps.placeholderHash.empty() &&
      newConcreteProps.placeholderHash != oldConcreteProps.placeholderHash) {
    std::string hash = newConcreteProps.placeholderHash;
    std::string hashType = toString(newConcreteProps.placeholderType);

    // On the very first mount, Fabric calls updateEventEmitter: *after*
    // updateProps:oldProps:, so _eventEmitter can still be null here — read
    // it lazily inside the block (by which time mounting has finished)
    // rather than capturing it upfront.
    __weak AnimatedImageLoaderView *weakSelf = self;
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      std::string pixels = AnimatedImageLoaderCore::decodePlaceholderHash(
          hash, hashType, kPaletteSampleSize, kPaletteSampleSize);
      std::string color = AnimatedImageLoaderCore::extractDominantColor(pixels);

      AnimatedImageLoaderView *strongSelf = weakSelf;
      if (strongSelf && strongSelf->_eventEmitter) {
        static_cast<const AnimatedImageLoaderViewEventEmitter &>(*strongSelf->_eventEmitter)
            .onPaletteExtracted({color});
      }
    });
  }

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> AnimatedImageLoaderViewCls(void)
{
  return AnimatedImageLoaderView.class;
}
