# Shimmer benchmarks

How the GPU `shimmer-shader` placeholder compares with the pure-JS `Animated` shimmer this library used before it went native. Run on 17 Nov 2026.

> **Read this first.** These are emulator and simulator numbers from one machine. They show trends, not what a real phone will do. A real-device run is still open (see [Open questions](#open-questions)).

## What was compared

| Variant | What it is |
|---|---|
| **Legacy** | The original skeleton from before the native rewrite (commit `b036098^`): an `Animated.View` translated by an `Animated.loop`, with `useNativeDriver: true` and a large `elevation` shadow. Kept in `example/src/bench/LegacyShimmer.tsx`. |
| **GPU** | `<AnimatedImgLoader placeholderType="shimmer-shader" />`: a Metal view on iOS, an OpenGL ES `GLSurfaceView` on Android. |

Both variants render with an empty `imageUri`, so the shimmer never stops.

One thing to know up front: the legacy shimmer **already ran off the JS thread**, because it used the native driver. So "zero JS-thread blocking" is not what separates the two. The differences below are about UI-thread and CPU cost, and how that scales.

## How it was measured

The **Bench** tab in the example app mounts N shimmers for 10 seconds per phase (after a 1 second settle), then reports:

- **JS frame rate, p95 and slow frames**: from `requestAnimationFrame` deltas. A frame over 25 ms counts as slow. This reflects the whole frame pipeline, not only the JS thread.
- **Android UI-thread jank and CPU**: `dumpsys gfxinfo` (reset before each phase, read after) and one `top` sample per phase.
- **JS-busy phases**: a loop blocks the JS thread for 25 ms every 50 ms, to see whether the shimmer survives a stalled JS thread.

Environments:

- **Android:** `Medium_Phone` emulator (Android 17, arm64, 4 GB RAM, host GPU).
- **iOS:** iPhone 17 Pro simulator (iOS 26.5), debug build from this branch's tree.

## Results

### Android emulator

| Phase | JS frames/s | Slow frames | p95 frame | App CPU | UI-thread jank (gfxinfo) |
|---|---|---|---|---|---|
| baseline (0) | 60 | 2% | 21.9 ms | 3.8% | n/a |
| legacy x1 | 38 | 45.6% | 50.1 ms | 11.5% | 36.4% |
| GPU x1 | 60 | 1% | 19.9 ms | 4.0% | not measurable |
| legacy x5 | 32 | 69% | 49.2 ms | 38.4% | 31.6% |
| GPU x5 | 60 | 1.2% | 20.2 ms | 4.0% | not measurable |
| legacy x10 | 33 | 68.6% | 49.7 ms | 136% | 36.1% |
| GPU x10 | **30** | **96.3%** | 44.7 ms | 4.0% | not measurable |
| legacy x5, JS busy | 32 | 57.2% | 63 ms | 38.4% | 28.9% |
| GPU x5, JS busy | 29 | 83% | 45.3 ms | 4.0% | not measurable |

`GLSurfaceView` draws outside the framework's frame stats, so `gfxinfo` reports no frames for the GPU variant. The jank column can't be compared across variants, and the "App CPU" for GPU may under-count render-thread work.

### iOS simulator

| Phase | JS frames/s | Slow frames | p95 frame |
|---|---|---|---|
| baseline (0) | 60 | 0% | 17.4 ms |
| legacy x1 | 60 | 0% | 17.3 ms |
| GPU x1 | 60 | 0% | 17.3 ms |
| legacy x5 | 60 | 0% | 17.2 ms |
| GPU x5 | 60 | 0% | 17.3 ms |
| legacy x10 | 60 | 0% | 17.3 ms |
| GPU x10 | 60 | 0% | 17.2 ms |
| legacy x5, JS busy | 60 | 22.3% | 41.6 ms |
| GPU x5, JS busy | 60 | 23.5% | 41.6 ms |

iOS CPU was not measured.

## What the numbers say

- **iOS:** no measurable difference at 1, 5 or 10 instances. Both stay at 60 fps. With the JS thread blocked, both slow down by the same amount, which is the busy loop and not the shimmer.
- **Android, 1 to 5 instances:** the GPU shimmer is much cheaper. Frame pacing stays at 60 and CPU stays at baseline, while the legacy shimmer drops to about 32 to 38 fps and its CPU rises from 11% to 38%. Part of the legacy cost is its heavy `elevation` shadow.
- **Android, 10 instances:** the GPU advantage disappears. Frame rate falls to 30 with 96% slow frames. Each Android shimmer is its own `GLSurfaceView` with its own EGL context and render thread, so the cost grows per instance.
- **JS thread:** when blocked, both Android variants fall to about 30 fps. The native shimmer does not make a stalled JS thread cheaper.

## Open questions

- **20 instances on Android:** mounting 20 GPU shimmers made the app process disappear within seconds on the emulator, reproducibly. The log shows all 20 surfaces created, then it just stops. There was no Java exception, no app tombstone and no kill line in the captured log, so the cause is unknown. The emulator reports its own GL layer as unstable on this API level, so this may be an emulator limit and not a library bug. The legacy variant at 20 was not run.
- **Real devices:** none of this has been run on a physical iPhone or Android phone.
- **iOS CPU and GPU cost:** not measured. Instruments on a real device would be the way.

## Practical guidance

Until a real-device run says otherwise, avoid putting many `shimmer-shader` placeholders on screen at once on Android, for example in a long list. Prefer `blurhash`, `thumbhash` or `dominant-color` there, which are plain image views with no per-instance GL context.

## Reproducing

1. Build and open the example app (`example/`, an Expo dev build) and go to the **Bench** tab.
2. Tap **Run**. Results appear on screen and are logged as `BENCH_START`, `BENCH_END` and `BENCH_RESULT` lines.
3. For Android frame stats, reset and read `adb shell dumpsys gfxinfo <package>` around each phase.

For scripted runs, `EXPO_PUBLIC_BENCH_AUTORUN=1` starts the suite when the Bench tab mounts, and `EXPO_PUBLIC_BENCH_ONLY=gpu-20,legacy-20` limits it to named phases. Restart Metro with `--clear` after changing either variable.
