<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployees } from '../composables/useEmployees'

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
        <div v-else class="photo-placeholder"></div>
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
}

.back-button {
  background: white;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 0.5rem 1rem;
  border-radius: 60px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.back-button:hover {
  background: #f1f5f9;
}

.detail-card {
  background: white;
  border-radius: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  padding: 3rem;
  box-shadow: 0 12px 30px rgba(0,0,0,0.05);
}

.detail-photo {
  flex: 1;
  min-width: 300px;
}

.detail-photo img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 28px;
  background: #e2e8f0;
}

.photo-placeholder {
  width: 100%;
  aspect-ratio: 4 / 5;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-radius: 28px;
}

.detail-info {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fullname {
  font-size: 3rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.position {
  font-size: 1.8rem;
  font-weight: 500;
  color: #1e293b;
  margin-top: 0.5rem;
}

.department {
  font-size: 1.4rem;
  color: #475569;
}

.contact-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 24px;
  margin-top: 1rem;
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.contact-item .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.contact-item .value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #0f172a;
}

/* Адаптивность */
@media (max-width: 768px) {
  .detail-card {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
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