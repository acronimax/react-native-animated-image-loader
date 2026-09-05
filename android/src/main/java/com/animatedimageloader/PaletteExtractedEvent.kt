package com.animatedimageloader

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

internal class PaletteExtractedEvent(
  surfaceId: Int,
  viewTag: Int,
  private val color: String
) : Event<PaletteExtractedEvent>(surfaceId, viewTag) {
  override fun getEventName() = EVENT_NAME

  override fun getEventData(): WritableMap {
    val event = Arguments.createMap()
    event.putString("color", color)
    return event
  }

  companion object {
    const val EVENT_NAME = "topPaletteExtracted"
  }
}
