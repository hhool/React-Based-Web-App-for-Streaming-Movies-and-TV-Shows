import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'fs'
import path from 'path'

// Write ads.txt content from environment variable to public/ads.txt
const adsTxtContent = process.env.VITE_ADS_TXT || ''
console.log('Writing ads.txt:', adsTxtContent)
const adsTxtPath = path.resolve(__dirname, 'public', 'ads.txt')
fs.writeFileSync(adsTxtPath, adsTxtContent)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/static/*.html', // Adjust the path to your HTML files
          dest: 'static/' // Copy to the root of the dist directory
        },
        {
          src: 'public/ads.txt', // Copy ads.txt file
          dest: '.' // Copy to the root of the dist directory
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
