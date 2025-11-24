import * as React from 'react';
import { StyleSheet, StatusBar, Text, View } from 'react-native';
import AnimatedImgLoader from 'react-native-animated-image-loader';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <View style={styles.titleContainer}>
        <Text
          style={styles.title}
          accessibilityRole={'text'}
          accessibilityLabel={'RN Animated Image Loader'}
        >
          Animated Image Loader
        </Text>
      </View>
      <AnimatedImgLoader
        imageUri={
          'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg'
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
