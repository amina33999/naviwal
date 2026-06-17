<script setup>
defineProps({
  title: String,
  message: String,
});
const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click.self="$emit('cancel')">
      <div class="confirm-modal">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="confirm-actions">
          <button @click="$emit('confirm')" class="btn-danger">Удалить</button>
          <button @click="$emit('cancel')" class="btn-secondary">Отмена</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;

  background: rgba(0, 0, 0, 0.5);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 2100;
}

/* модалка */
.confirm-modal {
  background: var(--surface);
  color: var(--text);

  border-radius: 28px;
  padding: 1.5rem;

  width: 90%;
  max-width: 380px;

  text-align: center;

  box-shadow: var(--shadow-strong);
}

/* заголовок */
.confirm-modal h3 {
  margin-bottom: 0.75rem;
  color: var(--text);
}

/* текст */
.confirm-modal p {
  margin-bottom: 1.5rem;
  color: var(--muted);
}

/* кнопки */
.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* опасная кнопка */
.btn-danger {
  background: #ef4444;
  color: white;

  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;

  cursor: pointer;
  transition: 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

/* вторичная кнопка */
.btn-secondary {
  background: var(--surface-alt);
  color: var(--text);

  border: 1px solid var(--border);
  padding: 0.5rem 1.2rem;
  border-radius: 40px;

  cursor: pointer;
  transition: 0.2s;
}

.btn-secondary:hover {
  background: var(--hover);
}

/* адаптив */
@media (max-width: 640px) {
  .confirm-modal {
    padding: 1.2rem;
  }
}
</style>