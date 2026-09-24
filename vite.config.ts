import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves this project from /Ver1/, not from the domain root.
// Set BASE_PATH=/ (or leave unset) for any other host that serves from root.
const base = process.env.BASE_PATH ?? '/Ver1/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-32.png'],
      manifest: {
        name: 'AI Hub',
        short_name: 'AI Hub',
        description:
          'Chat-Oberfläche für mehrere KI-Anbieter (Claude, ChatGPT, Gemini) mit nahtlosem Wechsel bei Nutzungslimits.',
        theme_color: '#7c3aed',
        background_color: '#171922',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: `${base}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
          { src: `${base}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
