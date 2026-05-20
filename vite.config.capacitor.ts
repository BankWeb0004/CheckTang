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
        // Manual chunk splitting for better caching and faster initial load
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-charts': ['recharts'],
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
