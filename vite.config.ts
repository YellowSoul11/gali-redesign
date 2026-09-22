import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves the site from /gali-redesign/; dev and local previews stay at /.
export default defineConfig({
  base: process.env.GH_PAGES ? '/gali-redesign/' : '/',
  plugins: [react(), tailwindcss()],
})
