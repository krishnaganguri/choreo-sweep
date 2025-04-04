import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    hmr: mode === 'development' ? {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      overlay: false,
      timeout: 30000
    } : false,
    headers: {
      'Cache-Control': 'no-store', // Disable caching in development
    },
  },
  plugins: [
    react(),
    process.env.NODE_ENV === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'web-vitals': path.resolve(__dirname, 'node_modules/web-vitals')
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      external: ['web-vitals'],
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-toast',
            '@radix-ui/react-label',
            '@radix-ui/react-slot'
          ]
        },
        // Add hashes to file names for cache busting
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // 4kb - inline small assets
  },
  preview: {
    headers: {
      // Enable caching for production preview
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
}));
