/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

const DESCRIPTION =
  'Jours fériés français et chinois, jours de rattrapage, calendrier lunaire et 24 termes solaires.';

export default defineConfig({
  // GitHub Pages 把站点放在 /<仓库名>/ 下
  base: '/calendrier-cn-fr/',
  plugins: [
    preact(),
    VitePWA({
      // 有新版本时 service worker 自动更新，下次打开即生效
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Calendrier franco-chinois',
        short_name: 'Calendrier',
        description: DESCRIPTION,
        lang: 'fr',
        display: 'standalone',
        theme_color: '#f7f6f3',
        background_color: '#f7f6f3',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 离线可用：程序、样式、图标全部预缓存（节假日数据已打包在 JS 里）
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
