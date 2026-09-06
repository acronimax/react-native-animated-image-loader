import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedImageLoaderView from './specs/AnimatedImageLoaderViewNativeComponent';
import { styles } from './styles';
import { DEFAULT_COLOR } from './constants';
import type { AnimatedImgLoaderProps } from './types';

export type { AnimatedImgLoaderProps, PlaceholderType } from './types';

/**
 * Loads `imageUri`, decoding and crossfading natively via a Fabric
 * component — off the JS thread entirely.
 *
 * With no `placeholderHash`/`placeholderType`, the native placeholder stays
 * empty and a colored `skeletonColor`/`skeletonStyles` backdrop shows
 * through until the image crossfades in, matching the pre-native-rewrite
 * look (minus its animated shimmer bar — pass `placeholderType`
 * (`'shimmer-shader'`, `'blurhash'`, `'thumbhash'`, `'dominant-color'`) to
 * opt into the new GPU-driven placeholders).
 */
const AnimatedImgLoader: React.FC<AnimatedImgLoaderProps> = ({
  imageUri,
  loaderContainerStyles = styles.loaderContainer,
  skeletonStyles = styles.skeletonContainer,
  skeletonColor = DEFAULT_COLOR.SKELETON_BG,
  placeholderHash,
  placeholderType,
  placeholderHashType,
  fadeDuration = 300,
  onPaletteExtracted,
}: AnimatedImgLoaderProps): React.ReactElement => {
  return (
    <View style={loaderContainerStyles}>
      <View
        style={[
          StyleSheet.absoluteFill,
          skeletonStyles,
          { backgroundColor: skeletonColor },
        ]}
      />
      <AnimatedImageLoaderView
        source={{ uri: imageUri }}
        placeholderHash={placeholderHash}
        placeholderType={placeholderType}
        placeholderHashType={placeholderHashType}
        fadeDuration={fadeDuration}
        onPaletteExtracted={onPaletteExtracted}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

export default AnimatedImgLoader;
