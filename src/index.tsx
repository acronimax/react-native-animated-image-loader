import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_COLOR } from './constants';

export type AnimatedImgLoaderProps = {
  width: number;
  height: number;
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
 * @param {number} AnimatedImgLoaderProps.height - The height of the image.
 * @param {number} AnimatedImgLoaderProps.width - The width of the image.
 * @param {number} [AnimatedImgLoaderProps.marginSpace=40] - The margin space around the image.
 * @param {string} AnimatedImgLoaderProps.imageUri - The URI of the image to be loaded.
 * @param {object} [AnimatedImgLoaderProps.loaderContainerStyles] - Additional styles for the loader container.
 * @param {object} [AnimatedImgLoaderProps.skeletonStyles] - Additional styles for the skeleton view.
 * @returns {JSX.Element} The AnimatedImgLoader component.
 */
const AnimatedImgLoader: React.FC<AnimatedImgLoaderProps> = ({
  height,
  width,
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
      outputRange: [-marginSpace / 2, width - marginSpace / 2],
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
    }).start(({ finished }): void => {
      if (finished && keepSkeleton) {
        skeletonAV.setValue(0);
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
        style={{
          opacity: imageOpacityStyle,
          width: width - marginSpace,
          height: height / 3,
        }}
        onLoadEnd={stopSkeleton}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  loaderContainer: {
    borderRadius: 8,
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT / 3,
    backgroundColor: DEFAULT_COLOR.SKELETON_BG,
    overflow: 'hidden',
  },
  skeleton: {
    opacity: 0.2,
    backgroundColor: DEFAULT_COLOR.SKELETON_LINE,
    shadowColor: DEFAULT_COLOR.WHITE,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
    width: SCREEN_WIDTH * 0.1,
  },
});
export default AnimatedImgLoader;
