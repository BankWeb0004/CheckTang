// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Plugin: alias dist/server/index.js -> dist/server/server.js so the
// TanStack Start prerender preview server (which expects "server.js")
// can boot the Cloudflare-bundled worker (emitted as "index.js").
function aliasServerOutput() {
  return {
    name: "alias-server-output",
    apply: "build" as const,
    closeBundle: {
      order: "post" as const,
      sequential: true,
      handler() {
        const dir = resolve(process.cwd(), "dist/server");
        const src = resolve(dir, "index.js");
        const dst = resolve(dir, "server.js");
        if (existsSync(src) && !existsSync(dst)) {
          copyFileSync(src, dst);
        }
      },
    },
  };
}

// Detect if building for Capacitor (native mobile)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

export default defineConfig({
  tanstackStart: {
    spa: {
      enabled: true,
      prerender: {
        outputPath: "/index.html",
      },
    },
  },

  vite: {
    // Use relative paths for Capacitor builds (file:// protocol compatibility)
    base: isCapacitorBuild ? './' : '/',
    
    // Optimized build configuration
    build: {
      // Enable minification for production
      minify: 'esbuild',
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['@tanstack/react-router', '@tanstack/react-start'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
            'vendor-charts': ['recharts'],
          },
          // Consistent chunk naming
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable source maps only in dev
      sourcemap: false,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'recharts'],
    },
    
    plugins: [
      aliasServerOutput(),
      VitePWA({

        // Use custom service worker from public/sw.js
        strategies: 'injectManifest',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,gif,svg,webp,woff,woff2,ttf,eot}'],
          globIgnores: ['**/node_modules/**/*', '**/android/**/*', '**/dist/**/*'],
        },
        srcDir: 'public',
        filename: 'sw.js',
        // PWA manifest configuration - only include in web builds
        manifest: isCapacitorBuild ? false : {
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
        // Register SW before hydration - disabled for native builds
        registerType: isCapacitorBuild ? 'autoUpdate' : 'prompt',
        // Disable SW registration for Capacitor builds
        selfDestroying: isCapacitorBuild,

      }),
    ],
  },
});
