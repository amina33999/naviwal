<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import userPlug from "../assets/icons/userPlug.png"

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
  <div class="employee-card">
    <div class="card-photo">
      <img v-if="employee.photo" :src="employee.photo" alt="фото" />
      <img v-else :src="userPlug" alt="заглушка" />
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
      <button class="detail-btn" @click="goToDetail">Подробнее</button>
    </div>
  </div>
</template>

<style scoped>
.employee-card {
  background: var(--surface);
  color: var(--text);

  border-radius: 24px;
  padding: 1.2rem;

  display: flex;
  align-items: stretch;
  gap: 1.5rem;

  box-shadow: var(--shadow-soft);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;

  cursor: pointer;
  overflow: hidden;

  width: 100%;
  max-width: 56rem;

  min-width: 0;

  position: relative;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-strong);
}

/* фото */
.card-photo {
  flex-shrink: 0;
  width: 140px;
  height: 140px;

  border-radius: 20px;
  overflow: hidden;

  background: var(--surface-alt);
}

.card-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* инфо */
.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  min-width: 0;
}

.name-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;

  min-width: 0;
}

.name-block span {
  display: block;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  max-width: 100%;
}

.surname {
  font-size: 1.3rem;
  font-weight: 700;
}

.firstname {
  font-size: 1rem;
  color: var(--muted);
}

.position {
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

.department {
  font-size: 0.85rem;
  color: var(--muted);
}

.card-action {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
}

.detail-btn {
  background: var(--button-bg);
  color: var(--button-text);

  border: none;
  padding: 0.5rem 1rem;
  border-radius: 999px;

  font-size: 0.8rem;
  font-weight: 500;

  cursor: pointer;
}

.detail-btn:hover {
  background: var(--button-hover);
}

@media (max-width: 768px) {
  .employee-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    gap: 1rem;
  }

  .card-photo {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }

  .card-info {
    align-items: center;
  }

  .name-block span {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .card-action {
    position: static;
    margin-top: 0.8rem;
    display: flex;
    justify-content: center;
  }

  .detail-btn {
    font-size: 0.8rem;
    padding: 0.45rem 0.9rem;
  }
}
</style>