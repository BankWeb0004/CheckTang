// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";



/**
 * CRITICAL: Ensure server.js is output without hash so TanStack Start's prerender
 * can find it immediately during the preview phase.
 * 
 * The Cloudflare plugin may update wrangler.json with hashed references, but we
 * need the actual entry file available at a stable location for prerender.
 */
function aliasServerOutput() {
  return {
    name: "alias-server-output",
    apply: "build" as const,
    closeBundle: {
      order: "post" as const,
      sequential: true,
      handler() {
        const dir = resolve(process.cwd(), "dist/server");
        const wranglerPath = resolve(dir, "wrangler.json");
        const dst = resolve(dir, "server.js");

        // Only create alias if server.js doesn't already exist or needs updating
        if (existsSync(dst)) {
          // If server.js was output directly by Vite (no hash), skip alias creation
          const currentContent = readFileSync(dst, "utf-8");
          if (!currentContent.includes("export { default }")) {
            return; // This is the actual entry file, not an alias
          }
        }

        let mainEntry: string | undefined;

        if (existsSync(wranglerPath)) {
          try {
            const wrangler = JSON.parse(readFileSync(wranglerPath, "utf-8")) as {
              main?: string;
            };
            mainEntry = wrangler.main;
          } catch {
            // Fall through to legacy path below.
          }
        }

        if (!mainEntry) {
          const legacySrc = resolve(dir, "index.js");
          if (existsSync(legacySrc)) {
            mainEntry = "index.js";
          }
        }

        if (!mainEntry || !existsSync(resolve(dir, mainEntry))) return;

        const importPath = mainEntry.replace(/\\/g, "/");
        writeFileSync(dst, `export { default } from "./${importPath}";\n`);
      },
    },
  };
}

// Detect if building for Capacitor (native mobile)
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

/**
 * Plugin to suppress import-analysis warnings for Capacitor modules
 * These modules are native-only and won't be bundled in web builds
 */
function suppressCapacitorWarnings(): import('vite').Plugin {
  return {
    name: 'suppress-capacitor-warnings',
    apply: 'serve',
    enforce: 'pre',
    resolveId(id: string) {
      // Return empty module for Capacitor imports in dev server
      if (id.startsWith('@capacitor/')) {
        return {
          id,
          external: true,
          moduleSideEffects: false,
        };
      }
    },
  };
}

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
    
    // Public directory (will be copied to dist/client/)
    publicDir: 'public',
    
    // Externalize Capacitor modules for SSR/dev server too
    ssr: {
      external: ['@capacitor/filesystem', '@capacitor/share', '@capacitor/core', '@capacitor/android'],
      noExternal: [],
    },
    
    // Optimized build configuration
    build: {
      // Enable minification for production
      minify: 'esbuild',
      // Target modern browsers for smaller bundles
      target: 'es2020',
      // Optimize chunk splitting
      rollupOptions: {
        // Externalize Capacitor modules for web builds (they're native-only)
        external: (id) => {
          // Exclude all @capacitor/* modules from web builds
          if (id.startsWith('@capacitor/')) {
            return true;
          }
          return false;
        },
        output: {
          /**
           * CRITICAL: Dynamic entry file naming to ensure server.js is available
           * for TanStack Start's prerender without hashing.
           * 
           * The prerender plugin needs dist/server/server.js to exist immediately
           * after build, BEFORE the alias plugin runs. By outputting the server
           * entry without hash, we guarantee it's at the expected location.
           */
          entryFileNames(chunkInfo) {
            // IMPORTANT: Server entry must NOT be hashed so prerender can find it
            // This ensures dist/server/server.js exists for the preview server
            if (chunkInfo.name === 'server') {
              return '[name].js'; // Output as dist/server/server.js (no hash, no assets/)
            }
            
            // Client and other entries use hashed names in assets folder for cache busting
            return 'assets/[name]-[hash].js';
          },
          
          // Dynamic manual chunk splitting that safely filters out external modules
          // This prevents conflicts with TanStack Start's SSR external module handling
          manualChunks(id) {
            // CRITICAL: Never chunk react, react-dom, or @tanstack core modules
            // as they are marked as external by TanStack Start for SSR
            if (id.includes('node_modules')) {
              // Explicitly exclude framework packages that are external
              if (
                /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id) ||
                id.includes('@tanstack/react-start') ||
                id.includes('@tanstack/react-router/dist/esm')
              ) {
                return null;
              }

              // Chunk UI libraries for better code splitting
              if (id.includes('@radix-ui')) {
                return 'vendor-ui';
              }

              // Chunk chart libraries
              if (id.includes('recharts') || id.includes('victory')) {
                return 'vendor-charts';
              }

              // Chunk form and validation libraries
              if (id.includes('@hookform') || id.includes('react-hook-form') || id.includes('zod')) {
                return 'vendor-forms';
              }

              // Chunk other important vendors
              if (
                id.includes('date-fns') ||
                id.includes('lucide-react') ||
                id.includes('embla-carousel') ||
                id.includes('react-resizable-panels')
              ) {
                return 'vendor-utils';
              }

              // Default vendor chunk for everything else in node_modules
              return 'vendor';
            }

            return null;
          },
          
          // Consistent chunk naming
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      // Enable source maps only in dev
      sourcemap: false,
      // CRITICAL: Copy public/ folder to dist/ (includes _routes.json)
      copyPublicDir: true,
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'recharts'],
      // Exclude Capacitor modules from optimization
      exclude: ['@capacitor/filesystem', '@capacitor/share', '@capacitor/core', '@capacitor/android'],
    },
    
    // Resolve configuration for external modules
    resolve: {
      // Don't try to resolve Capacitor modules - they're external/native-only
      noExternal: [],
    },
    
    plugins: [
      suppressCapacitorWarnings(),
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
