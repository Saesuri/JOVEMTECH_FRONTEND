import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate source maps for production debugging
    sourcemap: true,
    // Increase chunk size warning limit (KB)
    chunkSizeWarningLimit: 1000,
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React ecosystem
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            'lucide-react',
          ],
          // Canvas/visualization chunk
          'vendor-canvas': ['konva', 'react-konva', 'recharts'],
          // Utilities chunk
          'vendor-utils': ['date-fns', 'axios', 'clsx'],
        },
      },
    },
  },
  // Preview server configuration (for testing production builds)
  preview: {
    port: 4173,
    strictPort: true,
  },
})
