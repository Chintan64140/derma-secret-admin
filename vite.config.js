import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '^/(file-|video-)': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
