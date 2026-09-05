#include <metal_stdlib>
using namespace metal;

struct VertexOut {
  float4 position [[position]];
  float2 uv;
};

// Draws a fullscreen triangle from just the vertex id — no vertex buffer
// needed. The triangle overshoots the viewport on two sides; the GPU clips
// it to the visible [-1,1] NDC square, leaving an ordinary fullscreen quad.
vertex VertexOut shimmerVertex(uint vertexID [[vertex_id]]) {
  float2 positions[3] = {
    float2(-1.0, -1.0),
    float2( 3.0, -1.0),
    float2(-1.0,  3.0)
  };
  float2 uvs[3] = {
    float2(0.0, 1.0),
    float2(2.0, 1.0),
    float2(0.0, -1.0)
  };

  VertexOut out;
  out.position = float4(positions[vertexID], 0.0, 1.0);
  out.uv = uvs[vertexID];
  return out;
}

struct ShimmerUniforms {
  float time;
};

// A diagonal highlight band sweeps across the skeleton base color, looping
// every ~1.7s. Runs entirely on the GPU — no RN Animated loop.
fragment float4 shimmerFragment(VertexOut in [[stage_in]],
                                 constant ShimmerUniforms &uniforms [[buffer(0)]]) {
  float2 uv = in.uv;
  float diagonal = uv.x + uv.y;
  float sweep = fract(uniforms.time * 0.6) * 3.0 - 1.0;
  float dist = abs(diagonal - sweep);
  float highlight = smoothstep(0.35, 0.0, dist);

  float3 base = float3(0.87, 0.87, 0.87);
  float3 color = base + highlight * 0.10;
  return float4(color, 1.0);
}
