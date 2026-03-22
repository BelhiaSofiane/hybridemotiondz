import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import netlify from '@netlify/vite-plugin'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// SPA fallback only in production build — NOT in public/ (breaks `netlify dev` + Vite)
function spaRedirectsPlugin() {
  return {
    name: 'spa-redirects-to-dist',
    closeBundle() {
      writeFileSync(
        resolve('dist', '_redirects'),
        '/*    /index.html   200\n',
        'utf8'
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Emulates Netlify functions at /.netlify/functions/* when running `npm run dev`
  // (disabled automatically when NETLIFY_DEV=1 to avoid double middleware).
  plugins: [react(), netlify(), spaRedirectsPlugin()],
})
