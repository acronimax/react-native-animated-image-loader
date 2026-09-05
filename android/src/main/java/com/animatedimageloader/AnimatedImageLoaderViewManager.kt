package com.animatedimageloader

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.AnimatedImageLoaderViewManagerDelegate
import com.facebook.react.viewmanagers.AnimatedImageLoaderViewManagerInterface
import kotlin.concurrent.thread

// Sampling size for the placeholder decode feeding dominant-color
// extraction — this only needs enough pixels for a representative ambient
// color, not to render the placeholder itself (that lands in a later phase
// alongside the real crossfade rendering).
private const val PALETTE_SAMPLE_SIZE = 8.0

@ReactModule(name = AnimatedImageLoaderViewManager.NAME)
class AnimatedImageLoaderViewManager :
  SimpleViewManager<AnimatedImageLoaderView>(),
  AnimatedImageLoaderViewManagerInterface<AnimatedImageLoaderView> {
  private val mDelegate: ViewManagerDelegate<AnimatedImageLoaderView> =
    AnimatedImageLoaderViewManagerDelegate(this)

  override fun getDelegate(): ViewManagerDelegate<AnimatedImageLoaderView> {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): AnimatedImageLoaderView {
    return AnimatedImageLoaderView(context)
  }

  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return mutableMapOf(
      PaletteExtractedEvent.EVENT_NAME to mutableMapOf("registrationName" to "onPaletteExtracted")
    )
  }

  @ReactProp(name = "source")
  override fun setSource(view: AnimatedImageLoaderView?, value: ReadableMap?) {
    // Scaffolding only — no rendering logic yet.
  }

  @ReactProp(name = "placeholderHash")
  override fun setPlaceholderHash(view: AnimatedImageLoaderView?, value: String?) {
    view?.placeholderHash = value
  }

  @ReactProp(name = "placeholderType")
  override fun setPlaceholderType(view: AnimatedImageLoaderView?, value: String?) {
    view?.placeholderType = value ?: "blurhash"
  }

  @ReactProp(name = "fadeDuration")
  override fun setFadeDuration(view: AnimatedImageLoaderView?, value: Double) {
    // Scaffolding only — no rendering logic yet.
  }

  // Fires once per prop-update batch (after every @ReactProp setter above
  // has run), so placeholderHash and placeholderType are both settled
  // before we decode — regardless of what order RN sent them in.
  override fun onAfterUpdateTransaction(view: AnimatedImageLoaderView) {
    super.onAfterUpdateTransaction(view)

    val hash = view.placeholderHash
    if (hash.isNullOrEmpty() || hash == view.lastProcessedPlaceholderHash) {
      return
    }
    view.lastProcessedPlaceholderHash = hash

    val hashType = view.placeholderType
    val reactContext = view.context as ReactContext
    val reactTag = view.id

    thread {
      val pixels = AnimatedImageLoaderNative.decodePlaceholderHash(
        hash,
        hashType,
        PALETTE_SAMPLE_SIZE,
        PALETTE_SAMPLE_SIZE
      )
      val color = AnimatedImageLoaderNative.extractDominantColor(pixels)

      UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)?.dispatchEvent(
        PaletteExtractedEvent(
          UIManagerHelper.getSurfaceId(reactContext),
          reactTag,
          color
        )
      )
    }
  }

  companion object {
    const val NAME = "AnimatedImageLoaderView"
  }
}
