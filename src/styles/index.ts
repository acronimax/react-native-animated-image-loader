import { StyleSheet } from 'react-native';
import { DEFAULT_COLOR, SCREEN_HEIGHT, SCREEN_WIDTH } from '../constants';

export const styles = StyleSheet.create({
  loaderContainer: {
    borderRadius: 8,
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT / 3,
    backgroundColor: DEFAULT_COLOR.SKELETON_BG,
    overflow: 'hidden',
  },
  img: {
    height: '100%',
    width: '100%',
  },
  skeleton: {
    backgroundColor: DEFAULT_COLOR.SKELETON_BG,
    shadowColor: DEFAULT_COLOR.WHITE,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    elevation: 24,
  },
});
