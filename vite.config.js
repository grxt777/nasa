import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy Cesium assets and dust mass data
    {
      name: 'copy-assets',
      buildStart() {
        // Copy Cesium assets to public directory
        try {
          const cesiumPath = resolve('node_modules/cesium/Build/Cesium');
          const publicCesiumPath = resolve('public/Cesium');
          
          if (!existsSync(publicCesiumPath)) {
            mkdirSync(publicCesiumPath, { recursive: true });
          }
          
          // Use a simple approach - just ensure the directory exists
          // The files are already copied manually
          console.log('Cesium assets directory ready');
        } catch (error) {
          console.warn('Could not setup Cesium assets:', error.message)
        }

        // Copy dust mass data to public directory
        try {
          const dustMassPath = resolve('nasa_dusmass25');
          const publicDustMassPath = resolve('public/nasa_dusmass25');
          
          if (!existsSync(publicDustMassPath)) {
            mkdirSync(publicDustMassPath, { recursive: true });
          }
          
          console.log('Dust mass data directory ready');
        } catch (error) {
          console.warn('Could not setup dust mass data:', error.message)
        }
      }
    }
  ],
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
          'cesium-vendor': ['cesium'],
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
      'cesium',
      'chart.js',
      'react-chartjs-2',
      'lucide-react',
      'date-fns',
      'simple-statistics',
      'papaparse'
    ]
  },
  // Define global variables for Cesium
  define: {
    CESIUM_BASE_URL: JSON.stringify('/Cesium/')
  }
})
