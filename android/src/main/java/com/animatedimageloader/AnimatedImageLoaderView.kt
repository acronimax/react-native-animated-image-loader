package com.animatedimageloader

import android.content.Context
import android.util.AttributeSet
import android.view.View

// Scaffolding only — no rendering logic yet (native crossfade/shimmer
// compositing lands in a later phase). placeholderHash/placeholderType are
// tracked here so AnimatedImageLoaderViewManager.onAfterUpdateTransaction can
// react once both props have settled for a given update batch.
class AnimatedImageLoaderView : View {
  var placeholderHash: String? = null
  var placeholderType: String = "blurhash"
  internal var lastProcessedPlaceholderHash: String? = null

  constructor(context: Context?) : super(context)
  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
  constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  )
}
