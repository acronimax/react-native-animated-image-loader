export const DEMO_IMAGE_URI = 'https://wallpapercave.com/wp/wp5274503.png';

// Real Blurhash/ThumbHash for DEMO_IMAGE_URI (generated via the blurhash/
// thumbhash npm packages) — regenerate if the image changes.
export const DEMO_BLURHASH = 'LDHbvZ}b1FI[_}I.60Wnvqr_xT$%';
export const DEMO_THUMBHASH = '2HYKHAwpN2aIiHBaqHcqb6Xx1g==';

export type PlaceholderExampleSlug =
  | 'blurhash'
  | 'thumbhash'
  | 'dominant-color'
  | 'shimmer-shader'
  | 'custom-skeleton';

export const PLACEHOLDER_EXAMPLES: ReadonlyArray<{
  slug: PlaceholderExampleSlug;
  title: string;
  description: string;
}> = [
  {
    slug: 'blurhash',
    title: 'Blurhash',
    description: 'Decodes a Blurhash string into a blurred preview natively.',
  },
  {
    slug: 'thumbhash',
    title: 'ThumbHash',
    description: 'Decodes a ThumbHash string into a blurred preview natively.',
  },
  {
    slug: 'dominant-color',
    title: 'Dominant color',
    description:
      'Extracts an ambient color from the placeholder via a k-means pass.',
  },
  {
    slug: 'shimmer-shader',
    title: 'GPU shimmer shader',
    description:
      'A shimmer sweep rendered on the GPU (Metal / OpenGL ES) — no RN Animated loop.',
  },
  {
    slug: 'custom-skeleton',
    title: 'Custom skeleton',
    description: 'Customizing skeletonColor and skeletonStyles.',
  },
];
