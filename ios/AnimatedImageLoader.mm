#import "AnimatedImageLoader.h"
#import "AnimatedImageLoaderCore.h"

using facebook::react::animatedimageloader::AnimatedImageLoaderCore;

@implementation AnimatedImageLoader
RCT_EXPORT_MODULE()

// Scaffolding only — real Blurhash/ThumbHash JSI decoding lands in a later
// phase. The call into AnimatedImageLoaderCore (shared cpp/) is dispatched
// onto a background queue to validate the threading model early.
- (void)decodePlaceholderHash:(NSString *)hash
                        width:(double)width
                       height:(double)height
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  std::string hashCpp = std::string([hash UTF8String]);

  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    std::string result = AnimatedImageLoaderCore::decodePlaceholderHash(hashCpp, width, height);
    resolve([NSString stringWithUTF8String:result.c_str()]);
  });
}

- (void)extractDominantColor:(NSString *)base64Bytes
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  std::string bytesCpp = std::string([base64Bytes UTF8String]);

  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    std::string result = AnimatedImageLoaderCore::extractDominantColor(bytesCpp);
    resolve([NSString stringWithUTF8String:result.c_str()]);
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeAnimatedImageLoaderSpecJSI>(params);
}

@end
