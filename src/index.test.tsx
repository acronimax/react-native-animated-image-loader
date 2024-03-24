import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedImgLoader from './index';

describe('react-native-image-loader', () => {
  it('should render correctly', () => {
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
