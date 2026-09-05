#import "AnimatedImageLoader.h"
#import "AnimatedImageLoaderCore.h"

using facebook::react::animatedimageloader::AnimatedImageLoaderCore;

@implementation AnimatedImageLoader
RCT_EXPORT_MODULE()

// Blurhash/ThumbHash decoding delegates to the shared cpp/ core, dispatched
// onto a background queue to keep the JS thread free.
- (void)decodePlaceholderHash:(NSString *)hash
                     hashType:(NSString *)hashType
                        width:(double)width
                       height:(double)height
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  std::string hashCpp = std::string([hash UTF8String]);
  std::string hashTypeCpp = std::string([hashType UTF8String]);

  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    std::string result = AnimatedImageLoaderCore::decodePlaceholderHash(hashCpp, hashTypeCpp, width, height);
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
