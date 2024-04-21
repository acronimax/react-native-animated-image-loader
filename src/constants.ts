import { Dimensions } from 'react-native';

export const DEFAULT_COLOR = {
  SKELETON_BG: 'rgba(0,0,0,.2)',
  WHITE: '#FFF',
  BLACK: '#000',
} as const;
export const SCREEN_WIDTH: number = Dimensions.get('screen').width;
export const SCREEN_HEIGHT: number = Dimensions.get('screen').height;
