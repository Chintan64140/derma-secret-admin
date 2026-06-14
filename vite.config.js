import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

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
        bypass: (req, res, proxyOptions) => {
          const cleanUrl = req.url.split('?')[0];
          const localPath = path.join(process.cwd(), 'public', cleanUrl);
          if (fs.existsSync(localPath)) {
            return req.url;
          }
        }
      },
      '^/(file-|video-)': {
        target: 'https://derma-secret-backend.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
