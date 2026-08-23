import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  type ViewProps,
  Easing,
} from 'react-native';
import { styles } from './styles';
import { DEFAULT_COLOR, SCREEN_WIDTH } from './constants';

export type AnimatedImgLoaderProps = {
  imageUri: string;
  loaderContainerStyles?: ViewProps['style'];
  skeletonStyles?: ViewProps['style'];
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
  const imageOpacityAV = React.useRef(new Animated.Value(0)).current;
  const avSkeletonIndicator = React.useRef(new Animated.Value(0)).current;
  const skeletonAnimationRef = React.useRef<Animated.CompositeAnimation | null>(
    null
  );
  const [, setKeepSkeleton] = React.useState(true);

  const imageOpacityStyle = imageOpacityAV.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skeletonIndicatorStyle = avSkeletonIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    const animation = Animated.loop(
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
      ])
    );
    skeletonAnimationRef.current = animation;
    animation.start();

    return () => {
      animation.stop();
    };
  }, [avSkeletonIndicator]);

  const imageOpacityAnimation = () =>
    Animated.spring(imageOpacityAV, {
      useNativeDriver: true,
      toValue: 1,
      damping: 90,
      stiffness: 40,
    }).start();

  const stopSkeleton = () => {
    skeletonAnimationRef.current?.stop();
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
