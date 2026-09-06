package com.animatedimageloader

import android.content.Context
import android.util.AttributeSet
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView

// placeholderHash/placeholderType/sourceUri are tracked here so
// AnimatedImageLoaderViewManager.onAfterUpdateTransaction can react once all
// relevant props have settled for a given update batch, regardless of the
// order RN sent the individual @ReactProp setters in.
class AnimatedImageLoaderView : FrameLayout {
  var placeholderHash: String? = null
  var placeholderType: String = "blurhash"
  var placeholderHashType: String? = null
  var sourceUri: String? = null
  var fadeDurationMs: Double = 300.0

  internal var lastProcessedPlaceholderHash: String? = null
  internal var lastProcessedPlaceholderType: String? = null
  internal var lastProcessedPlaceholderHashType: String? = null
  internal var lastProcessedSourceUri: String? = null

  lateinit var placeholderImageView: ImageView
    private set
  lateinit var finalImageView: ImageView
    private set

  private var shimmerView: AnimatedImageLoaderShimmerView? = null

  constructor(context: Context) : super(context) {
    setUpImageViews(context)
  }

  constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
    setUpImageViews(context)
  }

  constructor(context: Context, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  ) {
    setUpImageViews(context)
  }

  private fun setUpImageViews(context: Context) {
    placeholderImageView = ImageView(context).apply { scaleType = ImageView.ScaleType.CENTER_CROP }
    finalImageView = ImageView(context).apply {
      scaleType = ImageView.ScaleType.CENTER_CROP
      alpha = 0f
    }

    addView(placeholderImageView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
    addView(finalImageView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun showShimmer() {
    var shimmer = shimmerView
    if (shimmer == null) {
      shimmer = AnimatedImageLoaderShimmerView(context)
      addView(shimmer, 0, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
      shimmerView = shimmer
    }
    shimmer.showShimmer()
    placeholderImageView.visibility = View.INVISIBLE
  }

  fun hideShimmer() {
    shimmerView?.hideShimmer()
    placeholderImageView.visibility = View.VISIBLE
  }
}
