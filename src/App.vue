<script setup>
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import TopNav from './components/TopNav.vue'
import ToastNotification from './components/ToastNotification.vue'
import { darkTheme, toggleTheme } from './composables/useTheme'

watch(
  darkTheme,
  (value) => {
    document.documentElement.classList.toggle('dark', value)
  },
  { immediate: true }
)

</script>

<template>
  <div id="app">
    <TopNav />
    <main class="main-content">
      <router-view />
    </main>
    <ToastNotification />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  transition: background 0.2s ease, color 0.2s ease;
}
 

:root {
  --bg: #f9f9f9;
  --text: #0f172a;
  --muted: #64748b;

  --surface: #ffffff;
  --surface-alt: #f1f5f9;

  --border: #e2e8f0;

  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-strong: 0 8px 20px rgba(0, 0, 0, 0.1);

  --hover: #f1f5f9;

  --button-bg: #0f172a;
  --button-hover: #000;
  --button-text: white;
}

html.dark {
  --bg: #0f1115;
  --text: #e5e7eb;
  --muted: #94a3b8;

  --surface: #161b22;
  --surface-alt: #1c212b;

  --border: #2a3441;

  --shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.35);
  --shadow-strong: 0 8px 20px rgba(0, 0, 0, 0.45);

  --hover: #1f2937;

  --button-bg: #334155;
  --button-hover: #475569;
  --button-text: white;
}

.main-content {
  min-height: calc(100vh - 72px);
  padding: 2rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}


/* Адаптация для планшетов */
@media (max-width: 1024px) {
  .main-content {
    padding: 1.5rem;
  }
}

/* Адаптация для телефонов */
@media (max-width: 640px) {
  .main-content {
    padding: 1rem;
  }
}
</style>