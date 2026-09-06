export const DEMO_IMAGE_URI = 'https://wallpapercave.com/wp/wp5274503.png';

// Real Blurhash/ThumbHash for DEMO_IMAGE_URI, so the decoded placeholder
// actually resembles the photo it precedes (and dominant-color extraction
// pulls a color that matches it too). Generated with the `blurhash` and
// `thumbhash` npm packages (encode(), rgbaToThumbHash()) from the image
// resized to 32x32 / to-fit-100px respectively — regenerate the same way if
// DEMO_IMAGE_URI changes again.
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
