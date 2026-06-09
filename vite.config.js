import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/uploads': {
        target: 'https://derma-secret-backend.onrender.com',
        changeOrigin: true,
      },
      '/assets': {
        target: 'https://derma-secret-backend.onrender.com',
        changeOrigin: true,
      },
      '^/(file-|video-)': {
        target: 'https://derma-secret-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
