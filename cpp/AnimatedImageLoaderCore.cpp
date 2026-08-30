#include "AnimatedImageLoaderCore.h"

namespace facebook::react::animatedimageloader {

std::string AnimatedImageLoaderCore::decodePlaceholderHash(
    const std::string& hash,
    double width,
    double height) {
  return "";
}

std::string AnimatedImageLoaderCore::extractDominantColor(
    const std::string& base64Bytes) {
  return "#000000";
}

} // namespace facebook::react::animatedimageloader
