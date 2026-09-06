#import "AnimatedImageLoaderShimmerView.h"

#import <QuartzCore/QuartzCore.h>

typedef struct {
  float time;
} ShimmerUniforms;

@interface AnimatedImageLoaderShimmerView () <MTKViewDelegate>

@end

@implementation AnimatedImageLoaderShimmerView {
  id<MTLCommandQueue> _commandQueue;
  id<MTLRenderPipelineState> _pipelineState;
  CFTimeInterval _startTime;
}

- (instancetype)initWithFrame:(CGRect)frameRect
{
  id<MTLDevice> device = MTLCreateSystemDefaultDevice();
  if (self = [super initWithFrame:frameRect device:device]) {
    [self _commonInit];
  }
  return self;
}

- (instancetype)initWithCoder:(NSCoder *)coder
{
  if (self = [super initWithCoder:coder]) {
    if (!self.device) {
      self.device = MTLCreateSystemDefaultDevice();
    }
    [self _commonInit];
  }
  return self;
}

- (void)_commonInit
{
  self.delegate = self;
  self.enableSetNeedsDisplay = NO;
  self.paused = NO;
  self.preferredFramesPerSecond = 60;

  _startTime = CACurrentMediaTime();
  _commandQueue = [self.device newCommandQueue];

  // The compiled .metal shader ships in its own resource bundle (see the
  // podspec), not the main app bundle.
  NSBundle *mainClassBundle = [NSBundle bundleForClass:[self class]];
  NSURL *shaderBundleURL = [mainClassBundle URLForResource:@"AnimatedImageLoader" withExtension:@"bundle"];
  NSBundle *shaderBundle = shaderBundleURL ? [NSBundle bundleWithURL:shaderBundleURL] : mainClassBundle;

  NSError *error = nil;
  id<MTLLibrary> library = [self.device newDefaultLibraryWithBundle:shaderBundle error:&error];
  if (!library) {
    library = [self.device newDefaultLibrary];
  }

  id<MTLFunction> vertexFunction = [library newFunctionWithName:@"shimmerVertex"];
  id<MTLFunction> fragmentFunction = [library newFunctionWithName:@"shimmerFragment"];

  MTLRenderPipelineDescriptor *descriptor = [MTLRenderPipelineDescriptor new];
  descriptor.vertexFunction = vertexFunction;
  descriptor.fragmentFunction = fragmentFunction;
  descriptor.colorAttachments[0].pixelFormat = self.colorPixelFormat;

  _pipelineState = [self.device newRenderPipelineStateWithDescriptor:descriptor error:&error];
}

- (void)drawInMTKView:(MTKView *)view
{
  MTLRenderPassDescriptor *passDescriptor = view.currentRenderPassDescriptor;
  id<CAMetalDrawable> drawable = view.currentDrawable;
  if (!passDescriptor || !drawable || !_pipelineState) {
    return;
  }

  id<MTLCommandBuffer> commandBuffer = [_commandQueue commandBuffer];
  id<MTLRenderCommandEncoder> encoder = [commandBuffer renderCommandEncoderWithDescriptor:passDescriptor];
  [encoder setRenderPipelineState:_pipelineState];

  ShimmerUniforms uniforms;
  uniforms.time = (float)(CACurrentMediaTime() - _startTime);
  [encoder setFragmentBytes:&uniforms length:sizeof(uniforms) atIndex:0];

  [encoder drawPrimitives:MTLPrimitiveTypeTriangle vertexStart:0 vertexCount:3];
  [encoder endEncoding];

  [commandBuffer presentDrawable:drawable];
  [commandBuffer commit];
}

- (void)mtkView:(MTKView *)view drawableSizeWillChange:(CGSize)size
{
  // No-op — the shader recomputes fullscreen coordinates every frame.
}

@end
