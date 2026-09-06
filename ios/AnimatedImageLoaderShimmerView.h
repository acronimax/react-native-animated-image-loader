#import <MetalKit/MetalKit.h>

NS_ASSUME_NONNULL_BEGIN

// A self-contained Metal-rendered shimmer sweep, used for the
// `shimmer-shader` placeholder type. Renders entirely on the GPU via a
// fragment shader (AnimatedImageLoaderShimmer.metal) — no RN Animated loop.
@interface AnimatedImageLoaderShimmerView : MTKView

@end

NS_ASSUME_NONNULL_END
