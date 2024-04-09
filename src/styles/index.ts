import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  loaderContainer: {
    borderRadius: 8,
    width: '90%',
    height: 250,
    overflow: 'hidden',
  },
  img: {
    height: '100%',
    width: '100%',
  },
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
