<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import EmployeeCard from '../components/EmployeeCard.vue'

const { employees, departments, search, filterByDepartment, filterByPosition } = useEmployees()
const searchQuery = ref('')
const selectedDepartment = ref('all')
const selectedPosition = ref('all')

import searchIcon from '../assets/icons/search.svg'

const deptDropdownOpen = ref(false)
const posDropdownOpen = ref(false)
const deptSelectRef = ref(null)
const posSelectRef = ref(null)

const selectedDepartmentLabel = computed(() => selectedDepartment.value === 'all' ? 'Все отделы' : selectedDepartment.value)
const selectedPositionLabel = computed(() => selectedPosition.value === 'all' ? 'Все должности' : selectedPosition.value)

const allPositions = computed(() => [...new Set(employees.value.map(emp => emp.position))])

function toggleDepartments() { deptDropdownOpen.value = !deptDropdownOpen.value; posDropdownOpen.value = false }
function togglePositions() { posDropdownOpen.value = !posDropdownOpen.value; deptDropdownOpen.value = false }
function selectDepartment(dept) { selectedDepartment.value = dept; deptDropdownOpen.value = false }
function selectPosition(pos) { selectedPosition.value = pos; posDropdownOpen.value = false }

// Сброс всех фильтров
function resetFilters() {
  searchQuery.value = ''
  selectedDepartment.value = 'all'
  selectedPosition.value = 'all'
}

function handleClickOutside(e) {
  if (deptSelectRef.value && !deptSelectRef.value.contains(e.target)) deptDropdownOpen.value = false
  if (posSelectRef.value && !posSelectRef.value.contains(e.target)) posDropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const filteredEmployees = computed(() => {
  let result = search(searchQuery.value)
  result = filterByDepartment(selectedDepartment.value, result)
  result = filterByPosition(selectedPosition.value, result)
  return result
})
</script>

<template>
  <div class="home-page">
    <div class="filters-bar">
      
      <div class="custom-select" @click="toggleDepartments" ref="deptSelectRef">
        <div class="custom-select__trigger">
          <span>{{ selectedDepartmentLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="deptDropdownOpen">
          <div class="custom-select__option" @click.stop="selectDepartment('all')">Все отделы</div>
          <div v-for="dept in departments" :key="dept" class="custom-select__option" @click.stop="selectDepartment(dept)">{{ dept }}</div>
        </div>
      </div>

      <!-- Должности -->
      <div class="custom-select" @click="togglePositions" ref="posSelectRef">
        <div class="custom-select__trigger">
          <span>{{ selectedPositionLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="posDropdownOpen">
          <div class="custom-select__option" @click.stop="selectPosition('all')">Все должности</div>
          <div v-for="pos in allPositions" :key="pos" class="custom-select__option" @click.stop="selectPosition(pos)">{{ pos }}</div>
        </div>
      </div>
      
      <!-- Поиск -->
      <div class="search-field">
        <input type="text" v-model="searchQuery" placeholder="Поиск">
        <img :src="searchIcon" alt="Поиск" class="search-icon">
      </div>
      
      <!-- Кнопка сброса -->
      <button class="reset-filters-btn" @click="resetFilters">Сбросить фильтры</button>
    </div>

    <div v-if="filteredEmployees.length === 0" class="empty-state">
      <p>Сотрудники не найдены</p>
    </div>
    <div v-else class="employees-grid">
      <EmployeeCard v-for="emp in filteredEmployees" :key="emp.id" :employee="emp" />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 2rem;
  align-items: center;
  background: transparent;
}

.custom-select {
  position: relative;
  min-width: 260px;
  background: white;
  border: none;
  border-radius: 60px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.custom-select__trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  background: white;
  border-radius: 60px;
  font-size: 1rem;
  color: #1e293b;
}

.custom-select__arrow {
  font-size: 0.75rem;
  color: #64748b;
}

.custom-select__options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  z-index: 20;
}

.custom-select__option {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
}

.custom-select__option:hover {
  background: #f1f5f9;
}

.search-field {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-field input {
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 2.8rem;
  border: none;
  border-radius: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  font-size: 1rem;
}

.search-field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #e3e3e3;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: block;
  opacity: 0.6;
}

.reset-filters-btn {
  background: #0f172a;
  color: white;
  border: 1px solid #cbd5e1;
  border-radius: 60px;
  padding: 0.9rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters-btn:hover {
  background: #000000;
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  background: white;
  border-radius: 32px;
  padding: 3rem;
  color: #64748b;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .employees-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .custom-select, .search-field {
    max-width: none;
  }
  .reset-filters-btn {
    width: 100%;
  }
  .employees-grid {
    grid-template-columns: 1fr;
  }
}
</style>