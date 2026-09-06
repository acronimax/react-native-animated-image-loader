import type { ViewProps } from 'react-native';
import type {
  PlaceholderType,
  PaletteExtractedEvent,
} from './specs/AnimatedImageLoaderViewNativeComponent';

export type { PlaceholderType, PaletteExtractedEvent };

export type AnimatedImgLoaderProps = {
  imageUri: string;
  loaderContainerStyles?: ViewProps['style'];
  skeletonStyles?: ViewProps['style'];
  skeletonColor?: string;
  /** Blurhash or ThumbHash encoded string, decoded natively off the JS thread. */
  placeholderHash?: string;
  /**
   * Visual placeholder effect to render while loading. Left unset, the
   * native placeholder stays empty and `skeletonColor`/`skeletonStyles`
   * show through instead — pass `'blurhash'`, `'thumbhash'`,
   * `'dominant-color'`, or `'shimmer-shader'` to opt into the GPU-driven
   * placeholders.
   *
   * Has no effect on web — react-native-web has no Fabric/TurboModule
   * support, so the web build always renders the plain JS skeleton.
   */
  placeholderType?: PlaceholderType;
  /** Native hardware crossfade duration in milliseconds. Has no effect on web. */
  fadeDuration?: number;
  /** Fires once the native side extracts a dominant/ambient color. Has no effect on web. */
  onPaletteExtracted?: (event: { nativeEvent: PaletteExtractedEvent }) => void;
};
