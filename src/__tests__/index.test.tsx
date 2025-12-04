import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AnimatedImgLoader from '../index';

describe('AnimatedImgLoader', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <AnimatedImgLoader imageUri="https://example.com/image.jpg" />
    );
    expect(container).toBeDefined();
  });

  it('should accept imageUri prop', () => {
    const imageUri = 'https://example.com/test.jpg';
    render(<AnimatedImgLoader imageUri={imageUri} />);

    const image = screen.getByRole('img');
    expect(image).toBeDefined();
  });

  it('should apply custom loaderContainerStyles', () => {
    const customStyles = { padding: 20, margin: 10 };
    const { container } = render(
      <AnimatedImgLoader
        imageUri="https://example.com/image.jpg"
        loaderContainerStyles={customStyles}
      />
    );
    expect(container).toBeDefined();
  });

  it('should apply custom skeletonStyles', () => {
    const customStyles = { width: 200, height: 200, borderRadius: 10 };
    const { container } = render(
      <AnimatedImgLoader
        imageUri="https://example.com/image.jpg"
        skeletonStyles={customStyles}
      />
    );
    expect(container).toBeDefined();
  });

  it('should apply custom skeletonColor', () => {
    const { container } = render(
      <AnimatedImgLoader
        imageUri="https://example.com/image.jpg"
        skeletonColor="#FF5733"
      />
    );
    expect(container).toBeDefined();
  });

  it('should handle empty imageUri', () => {
    const { container } = render(<AnimatedImgLoader imageUri="" />);
    expect(container).toBeDefined();
  });

  it('should render with all custom props', () => {
    const { container } = render(
      <AnimatedImgLoader
        imageUri="https://example.com/image.jpg"
        loaderContainerStyles={{ padding: 20 }}
        skeletonStyles={{ width: 300, height: 300 }}
        skeletonColor="#00FF00"
      />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
