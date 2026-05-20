// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server", preset: "vercel" },
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },

  vite: {
    plugins: [
      VitePWA({
        // Use custom service worker from public/sw.js
        strategies: 'injectManifest',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,eot}'],
          globIgnores: ['**/node_modules/**/*', '**/android/**/*', '**/dist/**/*'],
        },
        srcDir: 'public',
        filename: 'sw.js',
        // PWA manifest configuration
        manifest: {
          name: 'CheckTang',
          short_name: 'CheckTang',
          description: 'Expense tracker with offline support',
          theme_color: '#000000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          screenshots: [
            {
              src: '/assets/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              form_factor: 'wide',
            },
            {
              src: '/assets/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
          icons: [
            {
              src: '/assets/icons/icon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-167x167.png',
              sizes: '167x167',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-180x180.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-256x256.png',
              sizes: '256x256',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/assets/icons/icon-1024x1024.png',
              sizes: '1024x1024',
              type: 'image/png',
            },
            {
              src: '/assets/icons/app-icon.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'any',
            },
          ],
          categories: ['finance', 'productivity'],
          shortcuts: [
            {
              name: 'Add Transaction',
              short_name: 'Add',
              description: 'Quickly add a new transaction',
              url: '/?mode=add',
              icons: [
                {
                  src: '/assets/icons/icon-192x192.png',
                  sizes: '192x192',
                },
              ],
            },
            {
              name: 'View Dashboard',
              short_name: 'Dashboard',
              description: 'View your expense dashboard',
              url: '/?mode=dashboard',
              icons: [
                {
                  src: '/assets/icons/icon-192x192.png',
                  sizes: '192x192',
                },
              ],
            },
          ],
        },
        workbox: {
          // Workbox is used for additional caching configuration if needed
          maximumFileSizeToCacheInBytes: 5000000, // 5MB per file
          skipWaiting: true,
          clientsClaim: true,
          navigationPreload: true,
        },
        // Register SW before hydration
        registerType: 'prompt',
        // Don't reload the page automatically
        autoUpdate: true,
      }),
    ],
  },
});