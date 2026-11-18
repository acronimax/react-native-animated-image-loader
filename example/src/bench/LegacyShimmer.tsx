import * as React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  type ViewProps,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('screen').width;

/**
 * Benchmark baseline only: the skeleton of the pre-native implementation
 * (commit b036098^), copied verbatim minus the image. A translating
 * Animated.View driven by Animated.loop with useNativeDriver.
 */
export default function LegacyShimmer({
  style,
}: {
  style?: ViewProps['style'];
}) {
  const indicator = React.useRef(new Animated.Value(0)).current;

  const translateX = indicator.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
    extrapolate: 'clamp',
  });

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(indicator, {
          toValue: 0,
          duration: 2500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(indicator, {
          toValue: 1,
          duration: 2000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [indicator]);

  return (
    <Animated.View style={[style, styles.container]}>
      <Animated.View
        style={[styles.indicator, { transform: [{ translateX }] }]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,.2)',
    overflow: 'hidden',
  },
  indicator: {
    opacity: 0.5,
    height: '100%',
    paddingRight: 10,
    backgroundColor: '#fff',
    ...Platform.select({
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 20, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 24,
      },
    }),
  },
});
