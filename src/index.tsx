import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ImageStyle,
  type ViewStyle,
  ActivityIndicator,
  type ActivityIndicatorProps,
} from 'react-native';
import { styles } from './styles';
import { DEFAULT_COLOR } from './constants';

export type AnimatedImgLoaderProps = {
  imageUri: string;
  loaderContainerStyles?: ViewStyle;
  skeletonStyles?: ViewStyle;
  skeletonColor?: string;
  activityIndicatorProps?: ActivityIndicatorProps;
  animatedImgStyle?: ImageStyle;
};

/**
 * A React functional component for loading an animated image.
 *
 * @component
 * @param {object} AnimatedImgLoaderProps - The props for the AnimatedImgLoader component.
 * @param {string} AnimatedImgLoaderProps.imageUri - The URI of the image to be loaded.
 * @param {object} [AnimatedImgLoaderProps.loaderContainerStyles] - Additional styles for the loader container.
 * @param {object} [AnimatedImgLoaderProps.skeletonStyles] - Additional styles for the skeleton view.
 * @returns {React.Element} The AnimatedImgLoader component.
 */
const AnimatedImgLoader: React.FC<AnimatedImgLoaderProps> = ({
  imageUri,
  loaderContainerStyles,
  skeletonStyles,
  skeletonColor = DEFAULT_COLOR.SKELETON_BG,
  activityIndicatorProps = { color: DEFAULT_COLOR.BLACK, size: 'small' },
}: AnimatedImgLoaderProps): React.ReactElement => {
  const skeletonOpacityAV: Animated.Value = React.useRef(
    new Animated.Value(0.3)
  ).current;
  const imageOpacityAV: Animated.Value = React.useRef(
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

  const skeletonAnimation = () =>
    Animated.sequence([
      Animated.timing(skeletonOpacityAV, {
        toValue: 0.7,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(skeletonOpacityAV, {
        toValue: 0.3,
        duration: 800,
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
          { backgroundColor: skeletonColor, opacity: skeletonOpacityAV },
        ]}
      >
        <ActivityIndicator {...activityIndicatorProps} />
      </Animated.View>
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
