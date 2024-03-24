import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { styles } from './styles';

export type AnimatedImgLoaderProps = {
  imageUri: string;
  marginSpace?: number;
  loaderContainerStyles?: ViewStyle;
  skeletonStyles?: ViewStyle;
  animatedImgStyle?: ImageStyle;
};

/**
 * A React functional component for loading an animated image.
 *
 * @component
 * @param {object} AnimatedImgLoaderProps - The props for the AnimatedImgLoader component.
 * @param {number} [AnimatedImgLoaderProps.marginSpace=40] - The margin space around the image.
 * @param {string} AnimatedImgLoaderProps.imageUri - The URI of the image to be loaded.
 * @param {object} [AnimatedImgLoaderProps.loaderContainerStyles] - Additional styles for the loader container.
 * @param {object} [AnimatedImgLoaderProps.skeletonStyles] - Additional styles for the skeleton view.
 * @returns {JSX.Element} The AnimatedImgLoader component.
 */
const AnimatedImgLoader: React.FC<AnimatedImgLoaderProps> = ({
  marginSpace = 40,
  imageUri,
  loaderContainerStyles,
  skeletonStyles,
}: AnimatedImgLoaderProps): JSX.Element => {
  const skeletonAV: Animated.Value = React.useRef(
    new Animated.Value(0)
  ).current;
  const imageOpacityAV: Animated.Value = React.useRef(
    new Animated.Value(0)
  ).current;
  const [keepSkeleton, setKeepSkeleton] = React.useState(true);
  const translateSkeleton: Animated.AnimatedInterpolation<string | number> =
    skeletonAV.interpolate({
      inputRange: [0, 1],
      outputRange: [-marginSpace / 2, marginSpace / 2],
      extrapolate: 'clamp',
    });
  const imageOpacityStyle: Animated.AnimatedInterpolation<string | number> =
    imageOpacityAV.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

  const skeletonAnimation = () =>
    Animated.spring(skeletonAV, {
      useNativeDriver: true,
      toValue: 1,
      speed: 1,
      bounciness: 100,
    }).start((result: Animated.EndResult): void => {
      if (result.finished && keepSkeleton) {
        skeletonAnimation();
      }
    });

  const imageOpacityAnimation = () =>
    Animated.spring(imageOpacityAV, {
      useNativeDriver: true,
      toValue: 1,
      damping: 90,
      stiffness: 40,
    }).start();

  const startSkeletonAnimation = React.useCallback(skeletonAnimation, [
    skeletonAnimation,
  ]);

  React.useEffect((): void => {
    startSkeletonAnimation();
  }, [startSkeletonAnimation]);

  const stopSkeleton = (): void => {
    setKeepSkeleton(!keepSkeleton);
    imageOpacityAnimation();
  };

  return (
    <View
      style={[
        loaderContainerStyles ? loaderContainerStyles : styles.loaderContainer,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          skeletonStyles ? skeletonStyles : styles.skeleton,
          { transform: [{ translateX: translateSkeleton }] },
        ]}
      />
      <Animated.Image
        source={{ uri: imageUri }}
        style={[
          styles.img,
          {
            opacity: imageOpacityStyle,
          },
        ]}
        onLoadEnd={stopSkeleton}
      />
    </View>
  );
};
export default AnimatedImgLoader;
