import { codegenNativeComponent } from 'react-native';
import type { ViewProps } from 'react-native';
import type {
  Double,
  WithDefault,
  DirectEventHandler,
} from 'react-native/Libraries/Types/CodegenTypes';

export type PlaceholderType =
  'blurhash' | 'thumbhash' | 'shimmer-shader' | 'pixelate' | 'dominant-color';

export type PaletteExtractedEvent = Readonly<{
  color: string;
}>;

export interface NativeProps extends ViewProps {
  /** Target high-resolution image URI */
  source: Readonly<{ uri: string }>;

  /** Blurhash or ThumbHash encoded string */
  placeholderHash?: string;

  /** Visual placeholder effect to render while loading */
  placeholderType?: WithDefault<PlaceholderType, 'blurhash'>;

  /**
   * The real hash format ('blurhash' | 'thumbhash'), needed only when
   * `placeholderType` is a non-hash visual mode (`dominant-color`,
   * `pixelate`). Defaults to `'blurhash'` if left unset in that case.
   */
  placeholderHashType?: string;

  /** Native hardware crossfade duration in milliseconds */
  fadeDuration?: WithDefault<Double, 300>;

  /** Triggered once C++ extracts the ambient/dominant color */
  onPaletteExtracted?: DirectEventHandler<PaletteExtractedEvent>;
}

export default codegenNativeComponent<NativeProps>('AnimatedImageLoaderView');
