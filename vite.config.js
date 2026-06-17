import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  // Если сборка идет на Vercel — ставим '/', если в продакшн для GH Pages — '/educational/'
  const basePath = process.env.VERCEL ? '/' : (isProd ? '/educational/' : '/')

  return {
    plugins: [vue()],
    base: basePath,
  }
})