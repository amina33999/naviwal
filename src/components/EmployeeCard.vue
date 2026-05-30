<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});
const router = useRouter();

// Разбиваем ФИО
const surname = computed(() => {
  const parts = props.employee.fullName.trim().split(" ");
  return parts[0] || "";
});

const firstAndMiddle = computed(() => {
  const parts = props.employee.fullName.trim().split(" ");
  return parts.slice(1).join(" ") || "";
});

function goToDetail() {
  router.push({ name: "EmployeeDetail", params: { id: props.employee.id } });
}
</script>

<template>
  <div class="employee-card" @click="goToDetail">
    <div class="card-photo">
      <img v-if="employee.photo" :src="employee.photo" alt="фото" />
      <div v-else class="photo-placeholder"></div>
    </div>
    <div class="card-info">
      <div class="name-block">
        <span class="surname">{{ surname }}</span>
        <span class="firstname">{{ firstAndMiddle }}</span>
      </div>
      <div class="position">{{ employee.position }}</div>
      <div class="department">{{ employee.department }}</div>
    </div>
    <div class="card-action">
      <button class="detail-btn">Подробнее</button>
    </div>
  </div>
</template>

<style scoped>
.employee-card {
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.card-photo {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  border-radius: 20px;
  overflow: hidden;
}

.card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  background: #e2e8f0;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.name-block {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: baseline;
}

.surname {
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
}

.firstname {
  font-size: 1.1rem;
  color: #334155;
}

.position {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin-top: 0.5rem;
}

.department {
  font-size: 0.85rem;
  color: #64748b;
}

.card-action {
  flex-shrink: 0;
}

.detail-btn {
  background: #0f172a;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 60px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.detail-btn:hover {
  background: #000;
}

/* Адаптивность */
@media (max-width: 768px) {
  .employee-card {
    flex-wrap: wrap;
    gap: 1rem;
    text-align: center;
    justify-content: center;
  }
  .card-info {
    text-align: center;
  }
  .name-block {
    justify-content: center;
  }
  .card-photo {
    width: 100px;
    height: 100px;
  }
  .surname {
    font-size: 1.2rem;
  }
  .firstname {
    font-size: 0.9rem;
  }
}
</style>
