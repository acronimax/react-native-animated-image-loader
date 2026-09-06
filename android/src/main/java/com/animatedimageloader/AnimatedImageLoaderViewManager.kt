package com.animatedimageloader

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Base64
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
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

// Decoded small and stretched to fill — the standard Blurhash/ThumbHash
// look — and also used as the dominant-color sample buffer.
private const val PLACEHOLDER_DECODE_SIZE = 32.0

private fun bitmapFromRGBA8888Base64(base64: String, width: Int, height: Int): Bitmap? {
  if (base64.isEmpty()) {
    return null
  }
  val bytes = try {
    Base64.decode(base64, Base64.DEFAULT)
  } catch (e: IllegalArgumentException) {
    return null
  }
  if (bytes.size != width * height * 4) {
    return null
  }

  val pixels = IntArray(width * height)
  var byteIndex = 0
  for (i in pixels.indices) {
    val r = bytes[byteIndex].toInt() and 0xFF
    val g = bytes[byteIndex + 1].toInt() and 0xFF
    val b = bytes[byteIndex + 2].toInt() and 0xFF
    val a = bytes[byteIndex + 3].toInt() and 0xFF
    pixels[i] = (a shl 24) or (r shl 16) or (g shl 8) or b
    byteIndex += 4
  }

  val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
  bitmap.setPixels(pixels, 0, width, 0, 0, width, height)
  return bitmap
}

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
    view?.sourceUri = value?.getString("uri")
  }

  @ReactProp(name = "placeholderHash")
  override fun setPlaceholderHash(view: AnimatedImageLoaderView?, value: String?) {
    view?.placeholderHash = value
  }

  @ReactProp(name = "placeholderType")
  override fun setPlaceholderType(view: AnimatedImageLoaderView?, value: String?) {
    view?.placeholderType = value ?: "blurhash"
  }

  @ReactProp(name = "placeholderHashType")
  override fun setPlaceholderHashType(view: AnimatedImageLoaderView?, value: String?) {
    view?.placeholderHashType = value
  }

  @ReactProp(name = "fadeDuration")
  override fun setFadeDuration(view: AnimatedImageLoaderView?, value: Double) {
    view?.fadeDurationMs = value
  }

  // Fires once per prop-update batch (after every @ReactProp setter above
  // has run), so placeholderHash/placeholderType/source are all settled
  // before we act — regardless of what order RN sent them in.
  override fun onAfterUpdateTransaction(view: AnimatedImageLoaderView) {
    super.onAfterUpdateTransaction(view)

    val typeChanged = view.placeholderType != view.lastProcessedPlaceholderType
    view.lastProcessedPlaceholderType = view.placeholderType
    val hashTypeChanged = view.placeholderHashType != view.lastProcessedPlaceholderHashType
    view.lastProcessedPlaceholderHashType = view.placeholderHashType

    if (view.placeholderType == "shimmer-shader") {
      if (typeChanged) {
        view.showShimmer()
      }
    } else {
      if (typeChanged) {
        view.hideShimmer()
      }
      val hash = view.placeholderHash
      if (!hash.isNullOrEmpty() && (hash != view.lastProcessedPlaceholderHash || typeChanged || hashTypeChanged)) {
        view.lastProcessedPlaceholderHash = hash
        decodeAndApplyPlaceholder(view, hash, resolveHashType(view))
      }
    }

    val uri = view.sourceUri
    if (!uri.isNullOrEmpty() && uri != view.lastProcessedSourceUri) {
      view.lastProcessedSourceUri = uri
      loadFinalImage(view, uri, view.fadeDurationMs)
    }
  }

  // The real decode format: placeholderHashType if set, else placeholderType
  // itself when that already is a hash format, else "blurhash".
  private fun resolveHashType(view: AnimatedImageLoaderView): String {
    val explicitHashType = view.placeholderHashType
    if (!explicitHashType.isNullOrEmpty()) {
      return explicitHashType
    }
    return if (view.placeholderType == "blurhash" || view.placeholderType == "thumbhash") {
      view.placeholderType
    } else {
      "blurhash"
    }
  }

  private fun decodeAndApplyPlaceholder(view: AnimatedImageLoaderView, hash: String, hashType: String) {
    val reactContext = view.context as ReactContext
    val reactTag = view.id

    thread {
      val pixels = AnimatedImageLoaderNative.decodePlaceholderHash(
        hash,
        hashType,
        PLACEHOLDER_DECODE_SIZE,
        PLACEHOLDER_DECODE_SIZE
      )
      val color = AnimatedImageLoaderNative.extractDominantColor(pixels)
      val bitmap = bitmapFromRGBA8888Base64(
        pixels,
        PLACEHOLDER_DECODE_SIZE.toInt(),
        PLACEHOLDER_DECODE_SIZE.toInt()
      )

      UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag)?.dispatchEvent(
        PaletteExtractedEvent(UIManagerHelper.getSurfaceId(reactContext), reactTag, color)
      )

      if (bitmap != null) {
        view.post {
          view.placeholderImageView.setImageBitmap(bitmap)
        }
      }
    }
  }

  private fun loadFinalImage(view: AnimatedImageLoaderView, uriString: String, fadeDurationMs: Double) {
    thread {
      val bitmap = try {
        val connection = URL(uriString).openConnection() as HttpURLConnection
        connection.connectTimeout = 15000
        connection.readTimeout = 15000
        connection.inputStream.use { BitmapFactory.decodeStream(it) }
      } catch (e: IOException) {
        null
      }

      if (bitmap != null) {
        view.post {
          view.finalImageView.setImageBitmap(bitmap)
          view.finalImageView.alpha = 0f
          view.finalImageView.animate()
            .alpha(1f)
            .setDuration(fadeDurationMs.toLong())
            .start()
        }
      }
    }
  }

  companion object {
    const val NAME = "AnimatedImageLoaderView"
  }
}
