package com.animatedimageloader

// Shared JNI bridge into cpp/AnimatedImageLoaderCore, used by both the
// TurboModule (AnimatedImageLoaderModule) and the Fabric view manager
// (AnimatedImageLoaderViewManager), so the native library is only loaded
// once and the JNI declarations aren't duplicated.
internal object AnimatedImageLoaderNative {
  init {
    System.loadLibrary("animatedimageloader")
  }

  external fun decodePlaceholderHash(
    hash: String,
    hashType: String,
    width: Double,
    height: Double
  ): String

  external fun extractDominantColor(base64Bytes: String): String
}
