import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // <-- Убрали фигурные скобки, теперь импорт работает правильно!

createApp(App).use(router).mount('#app')