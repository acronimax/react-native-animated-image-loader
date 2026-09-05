#include "AnimatedImageLoaderCore.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <vector>

namespace facebook::react::animatedimageloader {

namespace {

// ---------------------------------------------------------------------------
// Shared base64 helpers
// ---------------------------------------------------------------------------

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

std::vector<uint8_t> base64Decode(const std::string& in) {
  static int8_t table[256];
  static bool initialized = false;
  if (!initialized) {
    std::fill(std::begin(table), std::end(table), -1);
    const char* chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (int i = 0; i < 64; i++) {
      table[static_cast<uint8_t>(chars[i])] = static_cast<int8_t>(i);
    }
    initialized = true;
  }

  std::vector<uint8_t> out;
  int value = 0;
  int bits = -8;
  for (unsigned char c : in) {
    if (c == '=') {
      break;
    }
    if (table[c] == -1) {
      continue;
    }
    value = (value << 6) + table[c];
    bits += 6;
    if (bits >= 0) {
      out.push_back(static_cast<uint8_t>((value >> bits) & 0xFF));
      bits -= 8;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Blurhash decoding
// ---------------------------------------------------------------------------

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

std::array<double, 3> decodeBlurhashDC(int value) {
  return {
      sRGBToLinear((value >> 16) & 0xFF),
      sRGBToLinear((value >> 8) & 0xFF),
      sRGBToLinear(value & 0xFF),
  };
}

std::array<double, 3> decodeBlurhashAC(int value, double maximumValue) {
  int quantR = value / (19 * 19);
  int quantG = (value / 19) % 19;
  int quantB = value % 19;

  return {
      signedPow((quantR - 9) / 9.0, 2.0) * maximumValue,
      signedPow((quantG - 9) / 9.0, 2.0) * maximumValue,
      signedPow((quantB - 9) / 9.0, 2.0) * maximumValue,
  };
}

std::string decodeBlurhash(const std::string& hash, int w, int h) {
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
  colors[0] = decodeBlurhashDC(dc);

  for (size_t i = 1; i < colors.size(); i++) {
    int ac = decode83(hash, 4 + i * 2, 2);
    if (ac < 0) {
      return "";
    }
    colors[i] = decodeBlurhashAC(ac, maximumValue);
  }

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

// ---------------------------------------------------------------------------
// ThumbHash decoding
// ---------------------------------------------------------------------------

std::vector<double> decodeThumbHashChannel(
    const std::vector<uint8_t>& hash,
    int acStart,
    int& acIndex,
    int nx,
    int ny,
    double scale) {
  std::vector<double> ac;
  for (int cy = 0; cy < ny; cy++) {
    for (int cx = cy ? 0 : 1; cx * ny < nx * (ny - cy); cx++) {
      int byteIdx = acStart + (acIndex >> 1);
      int shift = (acIndex & 1) << 2;
      acIndex++;
      int nibble = (hash[byteIdx] >> shift) & 15;
      ac.push_back((nibble / 7.5 - 1.0) * scale);
    }
  }
  return ac;
}

std::string decodeThumbHash(const std::string& hashStr, int w, int h) {
  std::vector<uint8_t> hash = base64Decode(hashStr);
  if (hash.size() < 5) {
    return "";
  }

  int header24 = hash[0] | (hash[1] << 8) | (hash[2] << 16);
  int header16 = hash[3] | (hash[4] << 8);

  double l_dc = (header24 & 63) / 63.0;
  double p_dc = ((header24 >> 6) & 63) / 31.5 - 1.0;
  double q_dc = ((header24 >> 12) & 63) / 31.5 - 1.0;
  double l_scale = ((header24 >> 18) & 31) / 31.0;
  int hasAlpha = header24 >> 23;
  double p_scale = ((header16 >> 3) & 63) / 63.0;
  double q_scale = ((header16 >> 9) & 63) / 63.0;
  int isLandscape = header16 >> 15;
  int lx = std::max(3, isLandscape ? (hasAlpha ? 5 : 7) : (header16 & 7));
  int ly = std::max(3, isLandscape ? (header16 & 7) : (hasAlpha ? 5 : 7));

  if (hash.size() < static_cast<size_t>(hasAlpha ? 6 : 5)) {
    return "";
  }
  double a_dc = hasAlpha ? (hash[5] & 15) / 15.0 : 1.0;
  double a_scale = (hash[5] >> 4) / 15.0;

  int acStart = hasAlpha ? 6 : 5;
  int acIndex = 0;
  std::vector<double> l_ac =
      decodeThumbHashChannel(hash, acStart, acIndex, lx, ly, l_scale);
  std::vector<double> p_ac =
      decodeThumbHashChannel(hash, acStart, acIndex, 3, 3, p_scale * 1.25);
  std::vector<double> q_ac =
      decodeThumbHashChannel(hash, acStart, acIndex, 3, 3, q_scale * 1.25);
  std::vector<double> a_ac;
  if (hasAlpha) {
    a_ac = decodeThumbHashChannel(hash, acStart, acIndex, 5, 5, a_scale);
  }

  std::vector<uint8_t> pixels(static_cast<size_t>(w) * h * 4);
  std::vector<double> fx(static_cast<size_t>(std::max(lx, hasAlpha ? 5 : 3)));
  std::vector<double> fy(static_cast<size_t>(std::max(ly, hasAlpha ? 5 : 3)));

  for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) {
      double l = l_dc, p = p_dc, q = q_dc, a = a_dc;

      int nFx = std::max(lx, hasAlpha ? 5 : 3);
      for (int cx = 0; cx < nFx; cx++) {
        fx[cx] = std::cos(M_PI / w * (x + 0.5) * cx);
      }
      int nFy = std::max(ly, hasAlpha ? 5 : 3);
      for (int cy = 0; cy < nFy; cy++) {
        fy[cy] = std::cos(M_PI / h * (y + 0.5) * cy);
      }

      {
        int j = 0;
        for (int cy = 0; cy < ly; cy++) {
          double fy2 = fy[cy] * 2;
          for (int cx = cy ? 0 : 1; cx * ly < lx * (ly - cy); cx++, j++) {
            l += l_ac[j] * fx[cx] * fy2;
          }
        }
      }

      {
        int j = 0;
        for (int cy = 0; cy < 3; cy++) {
          double fy2 = fy[cy] * 2;
          for (int cx = cy ? 0 : 1; cx < 3 - cy; cx++, j++) {
            double f = fx[cx] * fy2;
            p += p_ac[j] * f;
            q += q_ac[j] * f;
          }
        }
      }

      if (hasAlpha) {
        int j = 0;
        for (int cy = 0; cy < 5; cy++) {
          double fy2 = fy[cy] * 2;
          for (int cx = cy ? 0 : 1; cx < 5 - cy; cx++, j++) {
            a += a_ac[j] * fx[cx] * fy2;
          }
        }
      }

      double b = l - (2.0 / 3.0) * p;
      double r = (3 * l - b + q) / 2;
      double g = r - q;

      size_t idx = (static_cast<size_t>(y) * w + x) * 4;
      pixels[idx + 0] = static_cast<uint8_t>(std::clamp(255.0 * r, 0.0, 255.0));
      pixels[idx + 1] = static_cast<uint8_t>(std::clamp(255.0 * g, 0.0, 255.0));
      pixels[idx + 2] = static_cast<uint8_t>(std::clamp(255.0 * b, 0.0, 255.0));
      pixels[idx + 3] = static_cast<uint8_t>(std::clamp(255.0 * a, 0.0, 255.0));
    }
  }

  return base64Encode(pixels);
}

// ---------------------------------------------------------------------------
// Dominant-color extraction (k-means)
// ---------------------------------------------------------------------------

std::string kmeansDominantColor(
    const std::vector<uint8_t>& rgba,
    int k = 5,
    int maxIterations = 10) {
  std::vector<std::array<int, 3>> pixels;
  for (size_t i = 0; i + 3 < rgba.size(); i += 4) {
    // Skip near-transparent pixels — they shouldn't influence the ambient
    // color of a mostly-opaque image.
    if (rgba[i + 3] >= 16) {
      pixels.push_back({rgba[i], rgba[i + 1], rgba[i + 2]});
    }
  }

  if (pixels.empty()) {
    return "#000000";
  }

  int n = static_cast<int>(pixels.size());
  k = std::min(k, n);

  // Deterministic initialization: evenly spaced samples through the pixel
  // list, so the same input always produces the same result.
  std::vector<std::array<double, 3>> centroids(static_cast<size_t>(k));
  for (int i = 0; i < k; i++) {
    const auto& p = pixels[(static_cast<size_t>(i) * n) / k];
    centroids[i] = {
        static_cast<double>(p[0]),
        static_cast<double>(p[1]),
        static_cast<double>(p[2])};
  }

  std::vector<int> assignments(static_cast<size_t>(n), 0);
  for (int iter = 0; iter < maxIterations; iter++) {
    for (int pi = 0; pi < n; pi++) {
      const auto& p = pixels[pi];
      int best = 0;
      double bestDist = -1;
      for (int ci = 0; ci < k; ci++) {
        double dr = p[0] - centroids[ci][0];
        double dg = p[1] - centroids[ci][1];
        double db = p[2] - centroids[ci][2];
        double dist = dr * dr + dg * dg + db * db;
        if (bestDist < 0 || dist < bestDist) {
          bestDist = dist;
          best = ci;
        }
      }
      assignments[pi] = best;
    }

    std::vector<std::array<double, 4>> sums(
        static_cast<size_t>(k), std::array<double, 4>{0, 0, 0, 0});
    for (int pi = 0; pi < n; pi++) {
      int c = assignments[pi];
      sums[c][0] += pixels[pi][0];
      sums[c][1] += pixels[pi][1];
      sums[c][2] += pixels[pi][2];
      sums[c][3] += 1;
    }
    for (int ci = 0; ci < k; ci++) {
      if (sums[ci][3] > 0) {
        centroids[ci][0] = sums[ci][0] / sums[ci][3];
        centroids[ci][1] = sums[ci][1] / sums[ci][3];
        centroids[ci][2] = sums[ci][2] / sums[ci][3];
      }
    }
  }

  std::vector<int> counts(static_cast<size_t>(k), 0);
  for (int a : assignments) {
    counts[a]++;
  }
  int dominant = static_cast<int>(
      std::max_element(counts.begin(), counts.end()) - counts.begin());

  int r = static_cast<int>(std::clamp(std::round(centroids[dominant][0]), 0.0, 255.0));
  int g = static_cast<int>(std::clamp(std::round(centroids[dominant][1]), 0.0, 255.0));
  int b = static_cast<int>(std::clamp(std::round(centroids[dominant][2]), 0.0, 255.0));

  char buf[8];
  snprintf(buf, sizeof(buf), "#%02x%02x%02x", r, g, b);
  return std::string(buf);
}

} // namespace

std::string AnimatedImageLoaderCore::decodePlaceholderHash(
    const std::string& hash,
    const std::string& hashType,
    double width,
    double height) {
  int w = static_cast<int>(std::max(1.0, std::round(width)));
  int h = static_cast<int>(std::max(1.0, std::round(height)));

  if (hashType == "blurhash") {
    return decodeBlurhash(hash, w, h);
  }
  if (hashType == "thumbhash") {
    return decodeThumbHash(hash, w, h);
  }
  return "";
}

std::string AnimatedImageLoaderCore::extractDominantColor(
    const std::string& base64Bytes) {
  return kmeansDominantColor(base64Decode(base64Bytes));
}

} // namespace facebook::react::animatedimageloader
