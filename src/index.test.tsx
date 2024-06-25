import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedImgLoader from './index';
import { describe, expect, test } from '@jest/globals';

describe('react-native-image-loader', () => {
  test('should render correctly', () => {
    const wrapper = render(
      <AnimatedImgLoader
        imageUri={
          'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg'
        }
      />
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper).toBeDefined();
  });
});
