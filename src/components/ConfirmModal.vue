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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
}

.confirm-modal {
  background: white;
  border-radius: 28px;
  padding: 1.5rem;
  width: 90%;
  max-width: 380px;
  text-align: center;
}

.confirm-modal h3 {
  margin-bottom: 0.75rem;
}

.confirm-modal p {
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  cursor: pointer;
}

.btn-secondary {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1.2rem;
  border-radius: 40px;
  cursor: pointer;
}

/* Адаптивность */
@media (max-width: 640px) {
  .confirm-modal {
    padding: 1.2rem;
  }
}
</style>
