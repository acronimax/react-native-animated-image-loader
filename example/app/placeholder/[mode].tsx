import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
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

export default function PlaceholderExampleScreen() {
  const { mode } = useLocalSearchParams<{ mode: PlaceholderExampleSlug }>();
  const example = PLACEHOLDER_EXAMPLES.find((item) => item.slug === mode);
  const [paletteColor, setPaletteColor] = React.useState<string | null>(null);

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
            imageUri={DEMO_IMAGE_URI}
            placeholderHash={DEMO_BLURHASH}
            placeholderType="blurhash"
          />
        </DemoScreen>
      );
    case 'thumbhash':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={DEMO_IMAGE_URI}
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
          {/* placeholderType is the decode format here, not "dominant-color"
              — that value is a native bug (see #86): it gets passed
              straight through as the decode format, which the shared C++
              decoder doesn't recognize, so it silently decodes nothing and
              onPaletteExtracted fires with a black ("#000000") fallback
              instead of a real extracted color. blurhash is what actually
              decodes here; onPaletteExtracted fires regardless of
              placeholderType once decoding succeeds. */}
          <AnimatedImgLoader
            imageUri={DEMO_IMAGE_URI}
            placeholderHash={DEMO_BLURHASH}
            placeholderType="blurhash"
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
            imageUri={DEMO_IMAGE_URI}
            placeholderType="shimmer-shader"
          />
        </DemoScreen>
      );
    case 'custom-skeleton':
      return (
        <DemoScreen title={example.title} description={example.description}>
          <AnimatedImgLoader
            imageUri={DEMO_IMAGE_URI}
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
