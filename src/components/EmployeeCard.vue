<script setup>
import { computed } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import userPlug from "../assets/icons/user-plug.png"

const props = defineProps({
  employee: {
    type: Object,
    required: true
  }
})

const { formatDate } = useEmployees()

const truncatedBio = computed(() => {
  const bio = props.employee?.bio || ''
  const trimmed = bio.trim()
  if (!trimmed) return ''
  return trimmed.length > 90 ? trimmed.slice(0, 90) + '...' : trimmed
})
</script>

<template>
  <div class="employee-card">
    <!-- Левая часть: аватар -->
    <div class="card-avatar-wrapper">
      <img :src="employee.photo_url || userPlug" alt="Фото" class="employee-avatar">
    </div>
    
    <!-- Правая основная часть -->
    <div class="card-body">
      <div class="card-top-row">
        <div class="name-zone">
          <h3 class="fullname" :title="employee.name">{{ employee.name || 'Без имени' }}</h3>
          <p class="position">{{ employee.position || 'Должность не указана' }}</p>
        </div>
        <span class="department-badge">{{ employee.department_name || 'Отдел' }}</span>
      </div>
      
      <p class="bio-preview" v-if="truncatedBio">
        {{ truncatedBio }}
      </p>

      <div class="card-footer-row">
        <div class="contacts-inline">
          <span v-if="employee.email" class="contact-tag" :title="employee.email">
            <span class="icon">✉</span> {{ employee.email }}
          </span>
          <span v-if="employee.phone" class="contact-tag highlighted">
            <span class="icon">📞</span> Вн: <strong>{{ employee.phone }}</strong>
          </span>
        </div>
        
        <span class="hire-date" v-if="employee.hire_date">
          С {{ formatDate(employee.hire_date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employee-card {
  background: var(--surface);
  border-radius: 16px;
  /* Используем адаптивную тонкую рамку */
  border: 1px solid var(--border, rgba(128, 128, 128, 0.15));
  padding: 1.1rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  box-shadow: var(--shadow-soft);
  transition: all 0.2s ease-in-out;
  height: 100%;
  box-sizing: border-box;
}

.employee-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-strong);
  border-color: var(--button-bg, #4f46e5);
}

.card-avatar-wrapper {
  width: 68px;
  height: 68px;
  flex-shrink: 0;
}

.employee-avatar {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  object-fit: cover;
  /* Мягкая подложка, чтобы заглушка не резала глаз в темноте */
  background: rgba(128, 128, 128, 0.1);
}

.card-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0;
  height: 100%;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.name-zone {
  min-width: 0;
}

.fullname {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 0.15rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.position {
  font-size: 0.85rem;
  color: var(--text);
  opacity: 0.7;
  margin: 0;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.department-badge {
  flex-shrink: 0;
  /* Полупрозрачный фон под цвет текста темы */
  background: rgba(128, 128, 128, 0.1);
  color: var(--text);
  opacity: 0.9;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  letter-spacing: 0.02em;
}

.bio-preview {
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.4;
  margin: 0 0 0.75rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer-row {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  /* Тонкая адаптивная линия раздела */
  border-top: 1px solid var(--border, rgba(128, 128, 128, 0.1));
}

.contacts-inline {
  display: flex;
  gap: 0.5rem;
  min-width: 0;
}

.contact-tag {
  background: rgba(128, 128, 128, 0.08);
  color: var(--text);
  opacity: 0.85;
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.contact-tag.highlighted {
  /* Мягкая подсветка телефона */
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  opacity: 1;
}

.contact-tag .icon {
  opacity: 0.7;
}

.hire-date {
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
  font-weight: 500;
}

@media (max-width: 768px) {
  .employee-card {
    padding: 0.9rem;
    gap: 0.9rem;
  }
  
  .card-avatar-wrapper {
    width: 56px;
    height: 56px;
  }
  
  .card-footer-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
  
  .hire-date {
    align-self: flex-end;
  }
}
</style>