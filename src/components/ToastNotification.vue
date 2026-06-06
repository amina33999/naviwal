<script setup>
import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

// Простая внутренняя функция (без export)
const showToast = (message, type = 'success') => {
  const id = nextId++
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

// Делаем доступной глобально
window.showToast = showToast
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', toast.type]"
      >
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '⚠' }}</span>
        {{ toast.message }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 60px;
  background: #0f172a;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideUp 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  pointer-events: auto;
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ef4444;
}

.toast-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .toast {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }
}
</style>