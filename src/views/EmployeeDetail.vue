<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployees } from '../composables/useEmployees'
import userPlug from "../assets/icons/userPlug.png"
import arrowLeftIcon from '../assets/icons/arrow-left.svg'

const route = useRoute()
const router = useRouter()
const { getById, formatDate } = useEmployees()
const employee = ref(null)

onMounted(() => {
  const id = Number(route.params.id)
  employee.value = getById(id)
  if (!employee.value) router.push({ name: 'Home' })
})

function goBack() {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="detail-container" v-if="employee">
    <button class="back-button" @click="goBack">
      <img :src="arrowLeftIcon" alt="Назад"> Назад
    </button>

    <div class="detail-card">
      <div class="detail-photo">
        <img v-if="employee.photo" :src="employee.photo" alt="Фото">
        <img v-else :src="userPlug" alt="Заглушка">
      </div>

      <div class="detail-info">
        <h1 class="fullname">{{ employee.fullName }}</h1>
        <div class="position">{{ employee.position }}</div>
        <div class="department">{{ employee.department }}</div>

        <div class="contact-block">
          <div class="contact-item">
            <span class="label">Email</span>
            <span class="value">{{ employee.email }}</span>
          </div>
          <div class="contact-item">
            <span class="label">Телефон</span>
            <span class="value">{{ employee.phone }}</span>
          </div>
          <div class="contact-item">
            <span class="label">Дата приёма на работу</span>
            <span class="value">{{ formatDate(employee.hireDate) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-button img {
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  color: var(--text);
  min-width: 0;
}

/* кнопка назад */
.back-button {
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  color: var(--text);

  padding: 0.5rem 1rem;
  border-radius: 60px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 2rem;

  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;

  transition: 0.2s;
}

.back-button:hover {
  background: var(--hover);
}

/* карточка */
.detail-card {
  background: var(--surface);
  color: var(--text);

  border-radius: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 3rem;

  padding: 3rem;
  box-shadow: var(--shadow-soft);
  min-width: 0;
}

/* фото */
.detail-photo {
  flex: 1;
  min-width: 260px;
}

.detail-photo img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 28px;
  background: var(--surface-alt);
}

.photo-placeholder {
  width: 100%;
  aspect-ratio: 4 / 5;
  background: linear-gradient(145deg,
      var(--surface-alt),
      var(--border));
  border-radius: 28px;
}

/* текст */
.detail-info {
  flex: 2 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fullname {
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 700;
  margin: 0;
  color: var(--text);

  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.1;
}

.position {
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  font-weight: 500;
  color: var(--text);
  opacity: 0.9;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.department {
  font-size: clamp(1rem, 1.6vw, 1.4rem);
  color: var(--muted);
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* блок контактов */
.contact-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  background: var(--surface-alt);
  padding: 1.5rem;
  border-radius: 24px;
  margin-top: 1rem;
  min-width: 0;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.contact-item .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-item .value {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text);
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* адаптив */
@media (max-width: 768px) {
  .detail-card {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .detail-photo {
    min-width: 0;
    width: 100%;
  }

  .fullname {
    font-size: 2rem;
  }

  .position {
    font-size: 1.3rem;
  }

  .department {
    font-size: 1rem;
  }

  .contact-item .value {
    font-size: 1rem;
  }
}
</style>