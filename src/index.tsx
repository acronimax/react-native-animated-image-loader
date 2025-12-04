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
 * @param {string} imageUri - The URI of the image to be loaded.
 * @param {object} loaderContainerStyles - Additional styles for the loader container.
 * @param {object} skeletonStyles - Additional styles for the skeleton view.
 * @param {string} skeletonColor - The color for the skeleton background.
 * @returns {React.Element} The AnimatedImgLoader component.
 */
const AnimatedImgLoader: React.FC<AnimatedImgLoaderProps> = ({
  imageUri,
  loaderContainerStyles = styles.loaderContainer,
  skeletonStyles = styles.skeletonContainer,
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

  React.useEffect(() => {
    startSkeletonAnimation();
  }, [startSkeletonAnimation]);

  const stopSkeleton = () => {
    keepSkeletonRef.current = false;
    setKeepSkeleton(false);
    imageOpacityAnimation();
  };

  return (
    <View style={loaderContainerStyles}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          skeletonStyles,
          { backgroundColor: skeletonColor },
        ]}
      >
        <Animated.View
          style={[
            styles.skeletonIndicator,
            {
              transform: [{ translateX: skeletonIndicatorStyle }],
            },
          ]}
        />
      </Animated.View>
      <Animated.Image
        source={{ uri: imageUri }}
        role={'img'}
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
