import React from 'react';
import { render } from '@testing-library/react-native';
import AnimatedImgLoader from './index';

describe('react-native-image-loader', () => {
  it('should render correctly', () => {
    const wrapper = render(
      <AnimatedImgLoader
        animatedImgStyle={{}}
        height={100}
        width={100}
        imageUri={''}
      />
    );
    expect(wrapper).toMatchSnapshot();
    expect(wrapper).toBeDefined();
  });
});
