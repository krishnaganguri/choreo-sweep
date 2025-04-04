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
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
          ui: Object.keys(require('./package.json').dependencies)
            .filter(pkg => pkg.startsWith('@radix-ui')),
        },
        // Add hashes to file names for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.name || '';
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(fileName)) {
            return `assets/images/[name].[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(fileName)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          if (/\.css$/.test(fileName)) {
            return `assets/css/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        }
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
