<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Страница не найдена</h2>
      <p>Извините, запрашиваемая страница не существует или была перемещена.</p>
      <button @click="goHome" class="home-btn">Вернуться на главную</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  background: var(--surface);
  padding: 3rem;
  border-radius: 32px;
  box-shadow: var(--shadow-soft);
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: var(--text);
  opacity: 0.8;
}

h2 {
  font-size: 1.8rem;
  margin: 0.5rem 0;
  color: var(--text);
}

p {
  color: var(--muted);
  margin: 1rem 0 2rem;
}

.home-btn {
  background: var(--button-bg);
  color: var(--button-text);
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 40px;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s;
}

.home-btn:hover {
  background: var(--button-hover);
}
</style>