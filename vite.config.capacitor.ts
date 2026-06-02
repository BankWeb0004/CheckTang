/**
 * Vite Configuration for Capacitor (Pure Client-Side SPA)
 * 
 * This config bypasses TanStack Start's server/prerender requirements
 * and outputs a pure static SPA directly to dist/client for Capacitor.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Use relative paths for file:// protocol compatibility in Android WebView
  base: './',
  
  plugins: [
    react(),
    tailwindcss(),
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Output directly to dist/client (Capacitor's webDir)
    outDir: 'dist/client',
    emptyOutDir: true,
    
    // Enable minification for production
    minify: 'esbuild',
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Optimize chunk splitting
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Dynamic manual chunk splitting that safely filters out external modules
        // This prevents conflicts with framework package handling
        manualChunks(id) {
          // Never chunk react, react-dom, or @tanstack core modules
          if (id.includes('node_modules')) {
            // Explicitly exclude framework packages
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
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
        // Consistent chunk naming with relative paths
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Disable source maps for smaller bundle
    sourcemap: false,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
  },
  
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
