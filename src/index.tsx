import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT, DEFAULT_COLOR } from './constants';
//
// type AnimatedImgLoaderProps = {
//   width: number;
//   height: number;
// };

const IMG =
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg';

const AnimatedImgLoader: React.FC = () => {
  const skeletonAV = React.useRef(new Animated.Value(0)).current;
  const imageOpacityAV = React.useRef(new Animated.Value(0)).current;
  const [keepSkeleton, setKeepSkeleton] = React.useState(true);
  const translateSkeleton = skeletonAV.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, SCREEN_WIDTH - 20],
    extrapolate: 'clamp',
  });
  const imageOpacityStyle = imageOpacityAV.interpolate({
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
    }).start(({ finished }) => {
      if (finished && keepSkeleton) {
        console.log('here finish');
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

  React.useEffect(() => {
    startSkeletonAnimation();
  }, [startSkeletonAnimation]);

  const stopSkeleton = () => {
    setTimeout(() => {
      setKeepSkeleton(!keepSkeleton);
      imageOpacityAnimation();
    }, 2500);
  };

  return (
    <View style={styles.loaderContainer}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.skeleton,
          { transform: [{ translateX: translateSkeleton }] },
        ]}
      />
      <Animated.Image
        source={{ uri: IMG }}
        style={{ opacity: imageOpacityStyle }}
        width={SCREEN_WIDTH - 40}
        height={SCREEN_HEIGHT / 3}
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
