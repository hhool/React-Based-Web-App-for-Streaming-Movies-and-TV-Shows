import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/static/*.html', // Adjust the path to your HTML files
          dest: 'static/' // Copy to the root of the dist directory
        }
      ]
    })
  ],
  // vite.config.js
  server: {
    // Expose on all network interfaces
    host: '0.0.0.0',
    // History API Fallback
    historyApiFallback: true,
  }
})
