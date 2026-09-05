import * as React from 'react';
import { StyleSheet, StatusBar, Text, View } from 'react-native';
import AnimatedImgLoader from 'react-native-animated-image-loader';
import { SafeAreaView } from 'react-native-safe-area-context';
// Relative imports for Phase 1 native-scaffolding verification only (#43) —
// not part of the library's public API yet.
import NativeAnimatedImageLoader from '../../src/specs/NativeAnimatedImageLoader';
import AnimatedImageLoaderView from '../../src/specs/AnimatedImageLoaderViewNativeComponent';

export default function App() {
  const [nativeCheck, setNativeCheck] = React.useState('checking…');
  const [paletteCheck, setPaletteCheck] = React.useState(
    'waiting for onPaletteExtracted…'
  );

  React.useEffect(() => {
    const decodedByteCount = (pixels: string) =>
      pixels ? Math.floor((pixels.replace(/[=]+$/, '').length * 3) / 4) : 0;

    Promise.all([
      // Real Blurhash (#53) and ThumbHash (#54) test vectors — decoding both
      // into non-empty pixel buffers of the expected size proves the shared
      // cpp/ decoder is reachable end-to-end for each format, not just
      // returning a hardcoded stub.
      NativeAnimatedImageLoader.decodePlaceholderHash(
        'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        'blurhash',
        4,
        3
      ),
      NativeAnimatedImageLoader.decodePlaceholderHash(
        'XAcKNZqAh3dwiIiHeHiIh4BwB/iI',
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
      <StatusBar />
      <View style={styles.titleContainer}>
        <Text
          style={styles.title}
          accessibilityRole={'text'}
          accessibilityLabel={'RN Animated Image Loader'}
        >
          Animated Image Loader
        </Text>
      </View>
      <AnimatedImgLoader
        imageUri={
          'https://images.pexels.com/photos/14133018/pexels-photo-14133018.jpeg'
        }
      />
      {/* Phase 1 native-scaffolding verification (#43) — proves the
          TurboModule and Fabric component are reachable without crashing. */}
      <Text testID="native-check" style={styles.nativeCheck}>
        {nativeCheck}
      </Text>
      <Text testID="palette-check" style={styles.nativeCheck}>
        {paletteCheck}
      </Text>
      {/* #55 — decoding this placeholder and firing onPaletteExtracted with
          the computed dominant color proves the Fabric-side k-means wiring
          works end-to-end, not just the TurboModule path above. */}
      <AnimatedImageLoaderView
        source={{ uri: '' }}
        placeholderHash={'LEHV6nWB2yk8pyo0adR*.7kCMdnj'}
        placeholderType={'blurhash'}
        onPaletteExtracted={(event) => {
          setPaletteCheck(
            `onPaletteExtracted OK — color: ${event.nativeEvent.color}`
          );
        }}
        style={styles.fabricCheck}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  nativeCheck: {
    marginTop: 20,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fabricCheck: {
    width: 1,
    height: 1,
  },
});
