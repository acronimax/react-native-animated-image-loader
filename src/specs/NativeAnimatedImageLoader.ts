import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Decodes a Blurhash or ThumbHash string into a raw RGBA pixel buffer on a
   * background C++ thread and returns it base64-encoded. `hashType` must be
   * `'blurhash'` (base83-encoded text) or `'thumbhash'` (base64-encoded
   * bytes) — the two formats can't be reliably auto-detected.
   */
  decodePlaceholderHash(
    hash: string,
    hashType: string,
    width: number,
    height: number
  ): Promise<string>;

  /**
   * Extracts a dominant/ambient color (hex) from a decoded placeholder or
   * image byte buffer via a background k-means pass.
   */
  extractDominantColor(base64Bytes: string): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AnimatedImageLoader');
