import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ViewStyle,
  Easing,
} from 'react-native';
import { styles } from './styles';
import { DEFAULT_COLOR, SCREEN_WIDTH } from './constants';

export type AnimatedImgLoaderProps = {
  imageUri: string;
  loaderContainerStyles?: ViewStyle;
  skeletonStyles?: ViewStyle;
  skeletonColor?: string;
};

/**
 * A React functional component for loading an animated image.
 *
 * @component
 * @param {string} AnimatedImgLoaderProps.imageUri - The URI of the image to be loaded.
 * @param {object} AnimatedImgLoaderProps.loaderContainerStyles - Additional styles for the loader container.
 * @param {object} [AnimatedImgLoaderProps.skeletonStyles] - Additional styles for the skeleton view.
 * @param {string} [AnimatedImgLoaderProps.skeletonColor] - The color for the skeleton background.
 * @returns {React.Element} The AnimatedImgLoader component.
 */
const AnimatedImgLoader = ({
  imageUri,
  loaderContainerStyles,
  skeletonStyles,
  skeletonColor = DEFAULT_COLOR.SKELETON_BG,
}: AnimatedImgLoaderProps): React.ReactElement => {
  const imageOpacityAV: Animated.Value = React.useRef(
    new Animated.Value(0)
  ).current;
  const avSkeletonIndicator: Animated.Value = React.useRef(
    new Animated.Value(0)
  ).current;
  const [keepSkeleton, setKeepSkeleton] = React.useState(true);
  const keepSkeletonRef = React.useRef(true);
  const imageOpacityStyle: Animated.AnimatedInterpolation<string | number> =
    imageOpacityAV.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

  const skeletonIndicatorStyle: Animated.AnimatedInterpolation<number> =
    avSkeletonIndicator.interpolate({
      inputRange: [0, 1],
      outputRange: [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
      extrapolate: 'clamp',
    });

  const skeletonAnimation = () =>
    Animated.sequence([
      Animated.timing(avSkeletonIndicator, {
        toValue: 0,
        duration: 2500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(avSkeletonIndicator, {
        toValue: 1,
        duration: 2000,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start((result: Animated.EndResult) => {
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
    keepSkeletonRef.current = false;
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
          skeletonStyles ? skeletonStyles : styles.skeletonContainer,
          { backgroundColor: skeletonColor },
        ]}
      >
        <Animated.View
          accessibilityRole={'summary'}
          style={[
            styles.skeletonIndicator,
            {
              transform: [{ translateX: skeletonIndicatorStyle }],
            },
          ]}
        />
      </Animated.View>
      <Animated.Image
        accessibilityRole={'image'}
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
