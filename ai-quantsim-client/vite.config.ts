import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ✅ Add this

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ Proper absolute path
    },
  },
  server: {
    host: true, // Allow external connections
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for file changes in Docker
      interval: 1000, // Check for changes every second
    },
  },
})
