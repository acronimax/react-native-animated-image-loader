import type { ViewProps } from 'react-native';

import type {
  PaletteExtractedEvent,
  PlaceholderType,
} from './specs/AnimatedImageLoaderViewNativeComponent';

export type { PaletteExtractedEvent, PlaceholderType };

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
  /**
   * The real encoding of `placeholderHash` — only needed when
   * `placeholderType` is a visual mode that isn't itself a hash format
   * (`'dominant-color'`, `'pixelate'`); without it there's no way to know
   * which decoder to use. Ignored when `placeholderType` already is
   * `'blurhash'`/`'thumbhash'` (those double as the format) or
   * `'shimmer-shader'` (nothing to decode). Defaults to `'blurhash'` if left
   * unset in that situation. Has no effect on web.
   */
  placeholderHashType?: 'blurhash' | 'thumbhash';
  /** Native hardware crossfade duration in milliseconds. Has no effect on web. */
  fadeDuration?: number;
  /** Fires once the native side extracts a dominant/ambient color. Has no effect on web. */
  onPaletteExtracted?: (event: { nativeEvent: PaletteExtractedEvent }) => void;
};
