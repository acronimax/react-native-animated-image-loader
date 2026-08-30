package com.animatedimageloader

import com.facebook.fbreact.specs.NativeAnimatedImageLoaderSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import kotlin.concurrent.thread

class AnimatedImageLoaderModule(reactContext: ReactApplicationContext) :
  NativeAnimatedImageLoaderSpec(reactContext) {

  private external fun nativeDecodePlaceholderHash(
    hash: String,
    width: Double,
    height: Double
  ): String

  private external fun nativeExtractDominantColor(base64Bytes: String): String

  // Scaffolding only — real Blurhash/ThumbHash JSI decoding lands in a later
  // phase. The JNI call into AnimatedImageLoaderCore (shared cpp/) is
  // dispatched onto a background thread to validate the threading model
  // early.
  override fun decodePlaceholderHash(hash: String, width: Double, height: Double, promise: Promise) {
    thread {
      promise.resolve(nativeDecodePlaceholderHash(hash, width, height))
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
