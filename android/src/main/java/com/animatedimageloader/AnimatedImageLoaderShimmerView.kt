package com.animatedimageloader

import android.content.Context
import android.opengl.GLES20
import android.opengl.GLSurfaceView
import android.util.Log
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

// GPU-driven shimmer sweep for placeholderType 'shimmer-shader' — mirrors
// the iOS Metal implementation via GLSL ES, drawn continuously. Runs
// entirely on the GPU, not RN Animated.
class AnimatedImageLoaderShimmerView(context: Context) : GLSurfaceView(context) {

  init {
    setEGLContextClientVersion(2)
    setRenderer(ShimmerRenderer())
    renderMode = RENDERMODE_CONTINUOUSLY
  }

  fun showShimmer() {
    visibility = VISIBLE
    onResume()
  }

  fun hideShimmer() {
    onPause()
    visibility = GONE
  }

  private class ShimmerRenderer : Renderer {
    private var program = 0
    private var positionHandle = 0
    private var uvHandle = 0
    private var timeHandle = 0
    private val startTime = System.nanoTime()

    // A single triangle overshooting the viewport (-1..3), covering the
    // whole screen with no vertex-count overhead for a quad.
    private val vertexBuffer: FloatBuffer = ByteBuffer
      .allocateDirect(VERTEX_DATA.size * 4)
      .order(ByteOrder.nativeOrder())
      .asFloatBuffer()
      .put(VERTEX_DATA)
      .apply { position(0) }

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
      val vertexShader = compileShader(GLES20.GL_VERTEX_SHADER, VERTEX_SHADER_SRC)
      val fragmentShader = compileShader(GLES20.GL_FRAGMENT_SHADER, FRAGMENT_SHADER_SRC)

      program = GLES20.glCreateProgram()
      GLES20.glAttachShader(program, vertexShader)
      GLES20.glAttachShader(program, fragmentShader)
      GLES20.glLinkProgram(program)

      val linkStatus = IntArray(1)
      GLES20.glGetProgramiv(program, GLES20.GL_LINK_STATUS, linkStatus, 0)
      if (linkStatus[0] == GLES20.GL_FALSE) {
        Log.e(TAG, "Shimmer shader program link failed: ${GLES20.glGetProgramInfoLog(program)}")
      }

      positionHandle = GLES20.glGetAttribLocation(program, "aPosition")
      uvHandle = GLES20.glGetAttribLocation(program, "aUv")
      timeHandle = GLES20.glGetUniformLocation(program, "uTime")
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
      GLES20.glViewport(0, 0, width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
      GLES20.glClearColor(0.87f, 0.87f, 0.87f, 1f)
      GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT)
      GLES20.glUseProgram(program)

      val elapsedSeconds = (System.nanoTime() - startTime) / 1_000_000_000f
      GLES20.glUniform1f(timeHandle, elapsedSeconds)

      vertexBuffer.position(0)
      GLES20.glVertexAttribPointer(positionHandle, 2, GLES20.GL_FLOAT, false, STRIDE_BYTES, vertexBuffer)
      GLES20.glEnableVertexAttribArray(positionHandle)

      vertexBuffer.position(2)
      GLES20.glVertexAttribPointer(uvHandle, 2, GLES20.GL_FLOAT, false, STRIDE_BYTES, vertexBuffer)
      GLES20.glEnableVertexAttribArray(uvHandle)

      GLES20.glDrawArrays(GLES20.GL_TRIANGLES, 0, 3)
    }

    private fun compileShader(type: Int, source: String): Int {
      val shader = GLES20.glCreateShader(type)
      GLES20.glShaderSource(shader, source)
      GLES20.glCompileShader(shader)

      val compileStatus = IntArray(1)
      GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, compileStatus, 0)
      if (compileStatus[0] == GLES20.GL_FALSE) {
        Log.e(TAG, "Shimmer shader compile failed: ${GLES20.glGetShaderInfoLog(shader)}")
      }

      return shader
    }

    companion object {
      private const val TAG = "AnimatedImageLoaderShimmer"
      private const val STRIDE_BYTES = 4 * 4 // 4 floats (x, y, u, v) * 4 bytes

      // x, y, u, v per vertex — matching the Metal shader's positions/uvs arrays.
      private val VERTEX_DATA = floatArrayOf(
        -1f, -1f, 0f, 1f,
        3f, -1f, 2f, 1f,
        -1f, 3f, 0f, -1f
      )

      private const val VERTEX_SHADER_SRC = """
        attribute vec2 aPosition;
        attribute vec2 aUv;
        varying vec2 vUv;
        void main() {
          gl_Position = vec4(aPosition, 0.0, 1.0);
          vUv = aUv;
        }
      """

      private const val FRAGMENT_SHADER_SRC = """
        precision mediump float;
        varying vec2 vUv;
        uniform float uTime;
        void main() {
          float diagonal = vUv.x + vUv.y;
          float sweep = fract(uTime * 0.6) * 3.0 - 1.0;
          float dist = abs(diagonal - sweep);
          float highlight = smoothstep(0.35, 0.0, dist);

          vec3 base = vec3(0.87, 0.87, 0.87);
          vec3 color = base + highlight * 0.10;
          gl_FragColor = vec4(color, 1.0);
        }
      """
    }
  }
}
