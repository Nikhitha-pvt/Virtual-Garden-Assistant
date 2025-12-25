// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for deployment
  base: './',

  // Server options
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    // Enable HMR for development
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  },

  // Build options
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Enable minification for production
    minify: 'terser',
    // Configure output types
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },

  // Plugins will be added as needed
  plugins: [],

  // Optimize dependencies
  optimizeDeps: {
    include: ['three', 'bootstrap', 'jquery']
  },

  // Configure aliases
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@styles': '/src/styles',
      '@scripts': '/src/scripts',
      '@assets': '/public/assets'
    }
  }
});
