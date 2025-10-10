import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'ui-vendor': ['lucide-react'],
          'utils-vendor': ['date-fns', 'simple-statistics', 'papaparse']
        }
      }
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable source maps for debugging in production
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'leaflet',
      'chart.js',
      'react-chartjs-2',
      'lucide-react',
      'date-fns',
      'simple-statistics',
      'papaparse'
    ]
  }
})
