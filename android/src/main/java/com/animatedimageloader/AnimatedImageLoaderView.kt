package com.animatedimageloader

import android.content.Context
import android.util.AttributeSet
import android.view.View

// Scaffolding only — no rendering logic yet (native crossfade/shimmer
// compositing lands in a later phase).
class AnimatedImageLoaderView : View {
  constructor(context: Context?) : super(context)
  constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
  constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
    context,
    attrs,
    defStyleAttr
  )
}
