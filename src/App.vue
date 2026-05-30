<script setup>
import TopNav from './components/TopNav.vue'
</script>

<template>
  <div id="app">
    <TopNav />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f9f9f9;
  color: #0f172a;
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