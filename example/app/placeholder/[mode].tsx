import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { StyleSheet, Text } from 'react-native';
import AnimatedImgLoader from 'react-native-animated-image-loader';

import DemoScreen from '../../src/components/DemoScreen';
import {
  DEMO_BLURHASH,
  DEMO_IMAGE_URI,
  DEMO_THUMBHASH,
  PLACEHOLDER_EXAMPLES,
  type PlaceholderExampleSlug,
} from '../../src/demoData';

// Demo-only: hold the real image back so the placeholder is visible long
// enough to see the transition. An empty uri makes the native side skip loading.
const IMAGE_LOAD_DELAY_MS = 1500;

function useDelayedUri(uri: string, delayMs: number): string {
  const [delayedUri, setDelayedUri] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setDelayedUri(uri), delayMs);
    return () => clearTimeout(timer);
  }, [uri, delayMs]);
  return delayedUri;
}

export default function PlaceholderExampleScreen() {
  const { mode } = useLocalSearchParams<{ mode: PlaceholderExampleSlug }>();
  const example = PLACEHOLDER_EXAMPLES.find((item) => item.slug === mode);
  const [paletteColor, setPaletteColor] = React.useState<string | null>(null);
  const imageUri = useDelayedUri(DEMO_IMAGE_URI, IMAGE_LOAD_DELAY_MS);

  if (!example) {
    return (
      <DemoScreen title="Unknown example">
        <Text>No example found for &quot;{mode}&quot;.</Text>
      </DemoScreen>
    );
  }

  switch (example.slug) {
    case 'blurhash':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={imageUri}
            placeholderHash={DEMO_BLURHASH}
            placeholderType="blurhash"
          />
        </DemoScreen>
      );
    case 'thumbhash':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={imageUri}
            placeholderHash={DEMO_THUMBHASH}
            placeholderType="thumbhash"
          />
        </DemoScreen>
      );
    case 'dominant-color':
      return (
        <DemoScreen
          title={example.title}
          description={example.description}
          footer={
            <Text>
              {paletteColor
                ? `Extracted color: ${paletteColor}`
                : 'Extracting…'}
            </Text>
          }
        >
          {/* placeholderHashType set explicitly here just to demonstrate it
              — it'd default to 'blurhash' anyway for DEMO_BLURHASH. */}
          <AnimatedImgLoader
            imageUri={imageUri}
            placeholderHash={DEMO_BLURHASH}
            placeholderType="dominant-color"
            placeholderHashType="blurhash"
            onPaletteExtracted={(event) =>
              setPaletteColor(event.nativeEvent.color)
            }
          />
        </DemoScreen>
      );
    case 'shimmer-shader':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={imageUri}
            placeholderType="shimmer-shader"
          />
        </DemoScreen>
      );
    case 'custom-skeleton':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={imageUri}
            skeletonColor="#FF6B6B"
            skeletonStyles={styles.customSkeleton}
          />
        </DemoScreen>
      );
  }
}

const styles = StyleSheet.create({
  customSkeleton: {
    borderRadius: 24,
  },
});
