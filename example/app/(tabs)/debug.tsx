import * as React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Relative imports for native-scaffolding verification only (#43) — not part
// of the library's public API. Kept separate from the customer-facing demo
// screens so this raw TurboModule/Fabric plumbing doesn't clutter them.
import NativeAnimatedImageLoader from '../../../src/specs/NativeAnimatedImageLoader';
import AnimatedImageLoaderView from '../../../src/specs/AnimatedImageLoaderViewNativeComponent';
import {
  DEMO_BLURHASH,
  DEMO_IMAGE_URI,
  DEMO_THUMBHASH,
} from '../../src/demoData';

export default function DebugScreen() {
  const [nativeCheck, setNativeCheck] = React.useState('checking…');
  const [paletteCheck, setPaletteCheck] = React.useState(
    'waiting for onPaletteExtracted…'
  );

  React.useEffect(() => {
    const decodedByteCount = (pixels: string) =>
      pixels ? Math.floor((pixels.replace(/[=]+$/, '').length * 3) / 4) : 0;

    Promise.all([
      NativeAnimatedImageLoader.decodePlaceholderHash(
        DEMO_BLURHASH,
        'blurhash',
        4,
        3
      ),
      NativeAnimatedImageLoader.decodePlaceholderHash(
        DEMO_THUMBHASH,
        'thumbhash',
        6,
        4
      ),
      NativeAnimatedImageLoader.extractDominantColor('test-bytes'),
    ])
      .then(([blurhashPixels, thumbhashPixels, color]) => {
        setNativeCheck(
          `TurboModule OK — Blurhash ${decodedByteCount(blurhashPixels)}/${4 * 3 * 4}` +
            ` bytes, ThumbHash ${decodedByteCount(thumbhashPixels)}/${6 * 4 * 4}` +
            ` bytes, color: ${color}`
        );
      })
      .catch((error) => {
        setNativeCheck(`TurboModule FAILED — ${String(error)}`);
      });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Native diagnostics</Text>
        <Text style={styles.hint}>
          Raw TurboModule/Fabric checks used during native development — not
          part of the public API.
        </Text>
        <Text testID="native-check" style={styles.check}>
          {nativeCheck}
        </Text>
        <Text testID="palette-check" style={styles.check}>
          {paletteCheck}
        </Text>
        <AnimatedImageLoaderView
          source={{ uri: DEMO_IMAGE_URI }}
          placeholderHash={DEMO_BLURHASH}
          placeholderType={'blurhash'}
          fadeDuration={600}
          onPaletteExtracted={(event) => {
            setPaletteCheck(
              `onPaletteExtracted OK — color: ${event.nativeEvent.color}`
            );
          }}
          style={styles.fabricCheck}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 8,
    marginBottom: 16,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  check: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fabricCheck: {
    width: 200,
    height: 200,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
