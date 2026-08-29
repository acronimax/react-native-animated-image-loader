#import "AnimatedImageLoader.h"

@implementation AnimatedImageLoader
RCT_EXPORT_MODULE()

// Scaffolding only — real Blurhash/ThumbHash JSI decoding lands in a later
// phase (see the cpp/ JSI skeleton sub-task).
- (void)decodePlaceholderHash:(NSString *)hash
                        width:(double)width
                       height:(double)height
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  resolve(@"");
}

- (void)extractDominantColor:(NSString *)base64Bytes
                      resolve:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  resolve(@"#000000");
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeAnimatedImageLoaderSpecJSI>(params);
}

@end
