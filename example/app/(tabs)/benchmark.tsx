/* eslint-disable no-console */
import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import AnimatedImgLoader from 'react-native-animated-image-loader';
import { SafeAreaView } from 'react-native-safe-area-context';

import LegacyShimmer from '../../src/bench/LegacyShimmer';

type Variant = 'none' | 'legacy' | 'gpu';
type Phase = { name: string; variant: Variant; count: number; stress: boolean };

// EXPO_PUBLIC_BENCH_ONLY=gpu-20,legacy-20 runs just those phases.
const ONLY = process.env.EXPO_PUBLIC_BENCH_ONLY?.split(',');
const PHASE_MS = 10_000;
const FRAME_BUDGET_MS = 1000 / 60;
const TILE = 80;

// Each phase mounts `count` shimmers for PHASE_MS. `stress` blocks the JS
// thread ~50% of the time so we can see whether the shimmer survives it.
const PHASES: Phase[] = [
  { name: 'baseline-0', variant: 'none', count: 0, stress: false },
  { name: 'legacy-1', variant: 'legacy', count: 1, stress: false },
  { name: 'gpu-1', variant: 'gpu', count: 1, stress: false },
  { name: 'legacy-5', variant: 'legacy', count: 5, stress: false },
  { name: 'gpu-5', variant: 'gpu', count: 5, stress: false },
  { name: 'legacy-10', variant: 'legacy', count: 10, stress: false },
  { name: 'gpu-10', variant: 'gpu', count: 10, stress: false },
  { name: 'legacy-20', variant: 'legacy', count: 20, stress: false },
  { name: 'gpu-20', variant: 'gpu', count: 20, stress: false },
  { name: 'legacy-5-jsbusy', variant: 'legacy', count: 5, stress: true },
  { name: 'gpu-5-jsbusy', variant: 'gpu', count: 5, stress: true },
];

type Result = {
  name: string;
  frames: number;
  jsFps: number;
  p95Ms: number;
  maxMs: number;
  slowPct: number;
};

function summarize(name: string, deltas: number[], elapsedMs: number): Result {
  const sorted = [...deltas].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const slow = deltas.filter((d) => d > FRAME_BUDGET_MS * 1.5).length;
  return {
    name,
    frames: deltas.length,
    jsFps: Math.round((deltas.length / elapsedMs) * 1000),
    p95Ms: Math.round(p95 * 10) / 10,
    maxMs: Math.round((sorted[sorted.length - 1] ?? 0) * 10) / 10,
    slowPct: Math.round((slow / Math.max(deltas.length, 1)) * 1000) / 10,
  };
}

export default function BenchmarkScreen() {
  const { autorun } = useLocalSearchParams<{ autorun?: string }>();
  const [phase, setPhase] = React.useState<Phase | null>(null);
  const [results, setResults] = React.useState<Result[]>([]);
  const running = phase !== null;

  const run = React.useCallback(async () => {
    setResults([]);
    for (const p of PHASES.filter((x) => !ONLY || ONLY.includes(x.name))) {
      setPhase(p);
      // let the mount settle before measuring
      await new Promise((r) => setTimeout(r, 1000));

      const deltas: number[] = [];
      let last = performance.now();
      const start = last;
      let raf = 0;
      const tick = (t: number) => {
        deltas.push(t - last);
        last = t;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const busy = p.stress
        ? setInterval(() => {
            const t0 = Date.now();
            while (Date.now() - t0 < 25) {
              // intentionally block the JS thread
            }
          }, 50)
        : undefined;

      console.log(`BENCH_START ${p.name}`);
      await new Promise((r) => setTimeout(r, PHASE_MS));
      console.log(`BENCH_END ${p.name}`);

      cancelAnimationFrame(raf);
      if (busy) clearInterval(busy);
      const result = summarize(p.name, deltas, performance.now() - start);
      console.log(`BENCH_RESULT ${JSON.stringify(result)}`);
      setResults((prev) => [...prev, result]);
    }
    setPhase(null);
    console.log('BENCH_DONE');
  }, []);

  // `?autorun=1` or EXPO_PUBLIC_BENCH_AUTORUN=1 starts the suite on mount, for scripted runs.
  React.useEffect(() => {
    if (autorun === '1' || process.env.EXPO_PUBLIC_BENCH_AUTORUN === '1') {
      run();
    }
  }, [autorun, run]);

  const tiles = React.useMemo(
    () => Array.from({ length: phase?.count ?? 0 }, (_, i) => i),
    [phase]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Shimmer benchmark</Text>
      <Text style={styles.note}>
        Legacy = old Animated.View shimmer. GPU = shimmer-shader. Each phase
        runs {PHASE_MS / 1000}s.
      </Text>
      <Button
        title={running ? 'Running…' : 'Run'}
        onPress={run}
        disabled={running}
      />
      <Text style={styles.phase}>
        {phase ? `Phase: ${phase.name}` : 'Idle'}
      </Text>
      <View style={styles.grid}>
        {tiles.map((i) =>
          phase?.variant === 'legacy' ? (
            <LegacyShimmer key={i} style={styles.tile} />
          ) : (
            <AnimatedImgLoader
              key={i}
              imageUri=""
              placeholderType="shimmer-shader"
              loaderContainerStyles={styles.tile}
            />
          )
        )}
      </View>
      <ScrollView style={styles.results}>
        {results.map((r) => (
          <Text key={r.name} style={styles.row}>
            {r.name}: {r.jsFps}fps p95 {r.p95Ms}ms max {r.maxMs}ms slow{' '}
            {r.slowPct}%
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  note: { fontSize: 12, marginVertical: 6 },
  phase: { fontSize: 13, marginVertical: 6 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    maxHeight: 360,
    overflow: 'hidden',
  },
  tile: { width: TILE, height: TILE, borderRadius: 8, overflow: 'hidden' },
  results: { flex: 1, marginTop: 8 },
  row: { fontSize: 12, fontFamily: 'Courier' },
});
