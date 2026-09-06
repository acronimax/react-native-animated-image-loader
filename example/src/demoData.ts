export const DEMO_IMAGE_URI =
  'https://images.pexels.com/photos/14133018/pexels-photo-14133018.jpeg';

// Illustrative Blurhash/ThumbHash test vectors — not derived from
// DEMO_IMAGE_URI, so the decoded placeholder won't visually match the photo
// it precedes. Good enough to demonstrate the decode + crossfade behavior.
export const DEMO_BLURHASH = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';
export const DEMO_THUMBHASH = 'XAcKNZqAh3dwiIiHeHiIh4BwB/iI';

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
