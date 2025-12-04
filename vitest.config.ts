import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './vitest.setup.ts',
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
        '**/vitest.setup.ts',
      ],
    },
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
