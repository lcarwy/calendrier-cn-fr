/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  // GitHub Pages 把站点放在 /<仓库名>/ 下
  base: '/calendrier-cn-fr/',
  plugins: [preact()],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
