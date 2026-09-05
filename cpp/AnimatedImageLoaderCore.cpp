#include "AnimatedImageLoaderCore.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <vector>

namespace facebook::react::animatedimageloader {

namespace {

// Standard Blurhash base83 alphabet.
constexpr char kBase83Chars[] =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    "#$%*+,-.:;=?@[]^_{|}~";

int decode83(const std::string& str, size_t start, size_t length) {
  int value = 0;
  for (size_t i = start; i < start + length; i++) {
    const char* ptr = std::strchr(kBase83Chars, str[i]);
    if (ptr == nullptr) {
      return -1;
    }
    value = value * 83 + static_cast<int>(ptr - kBase83Chars);
  }
  return value;
}

double signedPow(double base, double exponent) {
  return std::copysign(std::pow(std::abs(base), exponent), base);
}

double sRGBToLinear(int value) {
  double v = static_cast<double>(value) / 255.0;
  if (v <= 0.04045) {
    return v / 12.92;
  }
  return std::pow((v + 0.055) / 1.055, 2.4);
}

uint8_t linearToSRGB(double value) {
  double v = std::clamp(value, 0.0, 1.0);
  double out = v <= 0.0031308 ? v * 12.92 * 255.0
                               : (1.055 * std::pow(v, 1.0 / 2.4) - 0.055) * 255.0;
  return static_cast<uint8_t>(std::clamp(std::round(out), 0.0, 255.0));
}

std::array<double, 3> decodeDC(int value) {
  return {
      sRGBToLinear((value >> 16) & 0xFF),
      sRGBToLinear((value >> 8) & 0xFF),
      sRGBToLinear(value & 0xFF),
  };
}

std::array<double, 3> decodeAC(int value, double maximumValue) {
  int quantR = value / (19 * 19);
  int quantG = (value / 19) % 19;
  int quantB = value % 19;

  return {
      signedPow((quantR - 9) / 9.0, 2.0) * maximumValue,
      signedPow((quantG - 9) / 9.0, 2.0) * maximumValue,
      signedPow((quantB - 9) / 9.0, 2.0) * maximumValue,
  };
}

std::string base64Encode(const std::vector<uint8_t>& bytes) {
  static const char kTable[] =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  std::string out;
  out.reserve(((bytes.size() + 2) / 3) * 4);

  size_t i = 0;
  while (i + 2 < bytes.size()) {
    uint32_t n = (static_cast<uint32_t>(bytes[i]) << 16) |
        (static_cast<uint32_t>(bytes[i + 1]) << 8) | bytes[i + 2];
    out.push_back(kTable[(n >> 18) & 0x3F]);
    out.push_back(kTable[(n >> 12) & 0x3F]);
    out.push_back(kTable[(n >> 6) & 0x3F]);
    out.push_back(kTable[n & 0x3F]);
    i += 3;
  }

  size_t remaining = bytes.size() - i;
  if (remaining == 1) {
    uint32_t n = static_cast<uint32_t>(bytes[i]) << 16;
    out.push_back(kTable[(n >> 18) & 0x3F]);
    out.push_back(kTable[(n >> 12) & 0x3F]);
    out.push_back('=');
    out.push_back('=');
  } else if (remaining == 2) {
    uint32_t n = (static_cast<uint32_t>(bytes[i]) << 16) |
        (static_cast<uint32_t>(bytes[i + 1]) << 8);
    out.push_back(kTable[(n >> 18) & 0x3F]);
    out.push_back(kTable[(n >> 12) & 0x3F]);
    out.push_back(kTable[(n >> 6) & 0x3F]);
    out.push_back('=');
  }

  return out;
}

} // namespace

std::string AnimatedImageLoaderCore::decodePlaceholderHash(
    const std::string& hash,
    double width,
    double height) {
  if (hash.size() < 6) {
    return "";
  }

  int sizeFlag = decode83(hash, 0, 1);
  if (sizeFlag < 0) {
    return "";
  }
  int numX = (sizeFlag % 9) + 1;
  int numY = (sizeFlag / 9) + 1;

  if (hash.size() != static_cast<size_t>(4 + 2 * numX * numY)) {
    return "";
  }

  int quantizedMaxValue = decode83(hash, 1, 1);
  if (quantizedMaxValue < 0) {
    return "";
  }
  double maximumValue = (quantizedMaxValue + 1) / 166.0;

  std::vector<std::array<double, 3>> colors(static_cast<size_t>(numX * numY));

  int dc = decode83(hash, 2, 4);
  if (dc < 0) {
    return "";
  }
  colors[0] = decodeDC(dc);

  for (size_t i = 1; i < colors.size(); i++) {
    int ac = decode83(hash, 4 + i * 2, 2);
    if (ac < 0) {
      return "";
    }
    colors[i] = decodeAC(ac, maximumValue);
  }

  int w = static_cast<int>(std::max(1.0, std::round(width)));
  int h = static_cast<int>(std::max(1.0, std::round(height)));

  std::vector<uint8_t> pixels(static_cast<size_t>(w) * h * 4);

  for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) {
      double r = 0;
      double g = 0;
      double b = 0;

      for (int j = 0; j < numY; j++) {
        for (int i = 0; i < numX; i++) {
          double basis =
              std::cos(M_PI * x * i / w) * std::cos(M_PI * y * j / h);
          const auto& color = colors[static_cast<size_t>(j * numX + i)];
          r += color[0] * basis;
          g += color[1] * basis;
          b += color[2] * basis;
        }
      }

      size_t idx = (static_cast<size_t>(y) * w + x) * 4;
      pixels[idx + 0] = linearToSRGB(r);
      pixels[idx + 1] = linearToSRGB(g);
      pixels[idx + 2] = linearToSRGB(b);
      pixels[idx + 3] = 255;
    }
  }

  return base64Encode(pixels);
}

std::string AnimatedImageLoaderCore::extractDominantColor(
    const std::string& base64Bytes) {
  return "#000000";
}

} // namespace facebook::react::animatedimageloader
