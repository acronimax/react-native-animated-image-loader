import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AnimatedImgLoader from './index';
import { describe, expect, test } from '@jest/globals';

describe('react-native-image-loader', () => {
  test('should render correctly', () => {
    render(
      <AnimatedImgLoader
        imageUri={
          'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg'
        }
      />
    );
    expect(screen).toMatchSnapshot();
    expect(screen).toBeDefined();
  });
});
