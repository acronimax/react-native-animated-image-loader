#pragma once

#include <string>

namespace facebook::react::animatedimageloader {

// Scaffolding only — real Blurhash/ThumbHash JSI decoding and dominant-color
// extraction land in a later phase. This class is the shared C++ core called
// by both platforms' TurboModule glue (ios/AnimatedImageLoader.mm,
// android/.../AnimatedImageLoaderModule.kt via JNI), off the JS thread.
class AnimatedImageLoaderCore {
 public:
  static std::string decodePlaceholderHash(
      const std::string& hash,
      double width,
      double height);

  static std::string extractDominantColor(const std::string& base64Bytes);
};

} // namespace facebook::react::animatedimageloader
