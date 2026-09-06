import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedImageLoaderView from './specs/AnimatedImageLoaderViewNativeComponent';
import { styles } from './styles';
import { DEFAULT_COLOR } from './constants';
import type { AnimatedImgLoaderProps } from './types';

export type { AnimatedImgLoaderProps, PlaceholderType } from './types';

/**
 * Loads `imageUri`, decoding and crossfading natively via a Fabric
 * component — off the JS thread entirely. Pass `placeholderType` to opt
 * into a GPU-driven placeholder (blurhash, thumbhash, dominant-color,
 * shimmer-shader); left unset, `skeletonColor`/`skeletonStyles` show
 * through instead.
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
