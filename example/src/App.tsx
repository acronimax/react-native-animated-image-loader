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

  React.useEffect(() => {
    Promise.all([
      NativeAnimatedImageLoader.decodePlaceholderHash('test-hash', 4, 3),
      NativeAnimatedImageLoader.extractDominantColor('test-bytes'),
    ])
      .then(([hash, color]) => {
        setNativeCheck(`TurboModule OK — hash: "${hash}", color: ${color}`);
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
          'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg'
        }
      />
      {/* Phase 1 native-scaffolding verification (#43) — proves the
          TurboModule and Fabric component are reachable without crashing. */}
      <Text testID="native-check" style={styles.nativeCheck}>
        {nativeCheck}
      </Text>
      <AnimatedImageLoaderView
        source={{ uri: '' }}
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
