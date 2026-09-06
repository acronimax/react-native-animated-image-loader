import * as React from 'react';
import AnimatedImgLoader from 'react-native-animated-image-loader';
import DemoScreen from '../../src/components/DemoScreen';
import { DEMO_IMAGE_URI } from '../../src/demoData';

/** The default usage of the library — no extra props beyond imageUri. */
export default function HomeScreen() {
  return (
    <DemoScreen
      title="Animated Image Loader"
      description="Default usage — just imageUri, nothing else."
    >
      <AnimatedImgLoader imageUri={DEMO_IMAGE_URI} />
    </DemoScreen>
  );
}
