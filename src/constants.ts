import { Dimensions } from 'react-native';

export const DEFAULT_COLOR = {
  SKELETON_BG: '#EEE',
  SKELETON_LINE: '#FFF',
  WHITE: '#FFF',
} as const;

export const SCREEN_WIDTH: number = Dimensions.get('screen').width;
export const SCREEN_HEIGHT: number = Dimensions.get('screen').height;
