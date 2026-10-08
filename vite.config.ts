import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte()],
  // Chemins relatifs : l'app est servie depuis les assets de l'APK
  base: './',
})
