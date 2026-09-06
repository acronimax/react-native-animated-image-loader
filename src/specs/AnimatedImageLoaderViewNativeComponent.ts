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
   * The real encoding of `placeholderHash` ('blurhash' | 'thumbhash').
   * Needed when `placeholderType` is a visual mode that isn't itself a hash
   * format (`dominant-color`, `pixelate`) — without it there's no way to
   * know which decoder to use. Ignored when `placeholderType` already IS a
   * hash format (`blurhash`/`thumbhash`, which double as the format) or is
   * `shimmer-shader` (nothing to decode). Defaults to `'blurhash'` if left
   * unset in that situation.
   */
  placeholderHashType?: string;

  /** Native hardware crossfade duration in milliseconds */
  fadeDuration?: WithDefault<Double, 300>;

  /** Triggered once C++ extracts the ambient/dominant color */
  onPaletteExtracted?: DirectEventHandler<PaletteExtractedEvent>;
}

export default codegenNativeComponent<NativeProps>('AnimatedImageLoaderView');
