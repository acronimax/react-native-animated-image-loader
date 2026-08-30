package com.animatedimageloader

import com.facebook.fbreact.specs.NativeAnimatedImageLoaderSpec
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class AnimatedImageLoaderModule(reactContext: ReactApplicationContext) :
  NativeAnimatedImageLoaderSpec(reactContext) {

  // Scaffolding only — real Blurhash/ThumbHash JSI decoding lands in a later
  // phase (see the cpp/ JSI skeleton sub-task).
  override fun decodePlaceholderHash(hash: String, width: Double, height: Double, promise: Promise) {
    promise.resolve("")
  }

  override fun extractDominantColor(base64Bytes: String, promise: Promise) {
    promise.resolve("#000000")
  }

  companion object {
    const val NAME = NativeAnimatedImageLoaderSpec.NAME
  }
}
