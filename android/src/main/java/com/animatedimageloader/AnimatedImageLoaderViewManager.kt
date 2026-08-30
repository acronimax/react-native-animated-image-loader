package com.animatedimageloader

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.AnimatedImageLoaderViewManagerDelegate
import com.facebook.react.viewmanagers.AnimatedImageLoaderViewManagerInterface

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

  @ReactProp(name = "source")
  override fun setSource(view: AnimatedImageLoaderView?, value: ReadableMap?) {
    // Scaffolding only — no rendering logic yet.
  }

  @ReactProp(name = "placeholderHash")
  override fun setPlaceholderHash(view: AnimatedImageLoaderView?, value: String?) {
    // Scaffolding only — no rendering logic yet.
  }

  @ReactProp(name = "placeholderType")
  override fun setPlaceholderType(view: AnimatedImageLoaderView?, value: String?) {
    // Scaffolding only — no rendering logic yet.
  }

  @ReactProp(name = "fadeDuration")
  override fun setFadeDuration(view: AnimatedImageLoaderView?, value: Double) {
    // Scaffolding only — no rendering logic yet.
  }

  companion object {
    const val NAME = "AnimatedImageLoaderView"
  }
}
