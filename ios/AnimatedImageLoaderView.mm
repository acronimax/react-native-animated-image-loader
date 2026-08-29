#import "AnimatedImageLoaderView.h"

#import <react/renderer/components/AnimatedImageLoaderSpec/ComponentDescriptors.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/EventEmitters.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/Props.h>
#import <react/renderer/components/AnimatedImageLoaderSpec/RCTComponentViewHelpers.h>

using namespace facebook::react;

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

@end

Class<RCTComponentViewProtocol> AnimatedImageLoaderViewCls(void)
{
  return AnimatedImageLoaderView.class;
}
