import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Decodes a Blurhash or ThumbHash string into a raw RGBA pixel buffer on a
   * background C++ thread and returns it base64-encoded.
   */
  decodePlaceholderHash(
    hash: string,
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
