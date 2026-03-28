import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache everything from the build (dist) folder
        runtimeCaching: [],
      },
      manifest: {
        name: 'Rooster CBT - JAMB UTME Simulator',
        short_name: 'Rooster CBT',
        description: 'Offline JAMB UTME exam simulator with 400+ questions.',
        theme_color: '#4f7cff',
        background_color: '#07090e',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
