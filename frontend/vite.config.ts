import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified vite config without path alias (avoids @types/node requirement)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
