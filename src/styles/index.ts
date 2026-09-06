import { Platform, StyleSheet } from 'react-native';

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
  skeletonIndicator: {
    opacity: 0.5,
    height: '100%',
    paddingRight: 10,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '20px 10px 20px rgba(0, 0, 0, 1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 20,
          height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 24,
      },
    }),
  },
});
