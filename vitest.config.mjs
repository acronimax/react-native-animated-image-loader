import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './vitest.setup.js',
    exclude: ['**/node_modules/**', '**/lib/**', '**/example/**', '**/*.d.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'lib/',
        'example/',
        '**/__tests__/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/vitest.config.ts',
        '**/vitest.setup.js',
      ],
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    // Vite has no built-in notion of RN's platform-extension resolution
    // (Metro/webpack pick index.web.tsx over index.tsx automatically) — this
    // mirrors that here so tests exercise the same web entry point real
    // web/Expo builds do, not the native Fabric-component entry point.
    extensions: [
      '.web.mjs',
      '.web.js',
      '.web.mts',
      '.web.ts',
      '.web.jsx',
      '.web.tsx',
      '.mjs',
      '.js',
      '.mts',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ],
  },
});
