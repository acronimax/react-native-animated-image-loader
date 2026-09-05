package com.animatedimageloader

import com.facebook.fbreact.specs.NativeAnimatedImageLoaderSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import kotlin.concurrent.thread

class AnimatedImageLoaderModule(reactContext: ReactApplicationContext) :
  NativeAnimatedImageLoaderSpec(reactContext) {

  private external fun nativeDecodePlaceholderHash(
    hash: String,
    hashType: String,
    width: Double,
    height: Double
  ): String

  private external fun nativeExtractDominantColor(base64Bytes: String): String

  // Blurhash/ThumbHash decoding delegates to the shared cpp/ core via JNI,
  // dispatched onto a background thread to keep the JS thread free.
  override fun decodePlaceholderHash(
    hash: String,
    hashType: String,
    width: Double,
    height: Double,
    promise: Promise
  ) {
    thread {
      promise.resolve(nativeDecodePlaceholderHash(hash, hashType, width, height))
    }
  }

  override fun extractDominantColor(base64Bytes: String, promise: Promise) {
    thread {
      promise.resolve(nativeExtractDominantColor(base64Bytes))
    }
  }

  companion object {
    const val NAME = NativeAnimatedImageLoaderSpec.NAME

    init {
      System.loadLibrary("animatedimageloader")
    }
  }
}
