import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// чтобы каждый раз не переключать createwebhistory (для просмотра на локалхост) на createwebhashhistory (для использования на gh-pages)
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' //даёт true при выполнении npm run build

  return {
    plugins: [vue()],
    base: isProd ? "/educational/" : "/",
  }
})