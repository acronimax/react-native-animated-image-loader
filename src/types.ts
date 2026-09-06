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
   * Visual placeholder to render while loading. Left unset, the native
   * placeholder stays empty and `skeletonColor`/`skeletonStyles` show
   * through instead. Has no effect on web.
   */
  placeholderType?: PlaceholderType;
  /**
   * The real hash format ('blurhash' | 'thumbhash'), needed only when
   * `placeholderType` is a non-hash visual mode (`'dominant-color'`,
   * `'pixelate'`). Defaults to `'blurhash'` if left unset in that case.
   */
  placeholderHashType?: 'blurhash' | 'thumbhash';
  /** Native hardware crossfade duration in milliseconds. Has no effect on web. */
  fadeDuration?: number;
  /** Fires once the native side extracts a dominant/ambient color. Has no effect on web. */
  onPaletteExtracted?: (event: { nativeEvent: PaletteExtractedEvent }) => void;
};
