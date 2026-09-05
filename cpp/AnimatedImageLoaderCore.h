#pragma once

#include <string>

namespace facebook::react::animatedimageloader {

// Shared C++ core called by both platforms' TurboModule glue
// (ios/AnimatedImageLoader.mm, android/.../AnimatedImageLoaderModule.kt via
// JNI), off the JS thread.
class AnimatedImageLoaderCore {
 public:
  // Decodes a Blurhash (base83 text, hashType "blurhash") or ThumbHash
  // (base64-encoded bytes, hashType "thumbhash") string into a
  // base64-encoded RGBA8888 pixel buffer of size width*height*4 bytes.
  // Returns an empty string if the hash is malformed or hashType is
  // unrecognized.
  static std::string decodePlaceholderHash(
      const std::string& hash,
      const std::string& hashType,
      double width,
      double height);

  // Scaffolding only — real dominant-color extraction lands in a later
  // phase.
  static std::string extractDominantColor(const std::string& base64Bytes);
};

} // namespace facebook::react::animatedimageloader
