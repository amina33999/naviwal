<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

const itemsPerLoad = 6
const visibleCount = ref(itemsPerLoad)
const loading = ref(false)
const hasMore = computed(() => visibleCount.value < filteredEmployees.value.length)

const selectedDepartmentLabel = computed(() => selectedDepartment.value === 'all' ? 'Все отделы' : selectedDepartment.value)
const selectedPositionLabel = computed(() => selectedPosition.value === 'all' ? 'Все должности' : selectedPosition.value)

const allPositions = computed(() => [...new Set(employees.value.map(emp => emp.position))])

function toggleDepartments() { deptDropdownOpen.value = !deptDropdownOpen.value; posDropdownOpen.value = false }
function togglePositions() { posDropdownOpen.value = !posDropdownOpen.value; deptDropdownOpen.value = false }
function selectDepartment(dept) { selectedDepartment.value = dept; deptDropdownOpen.value = false }
function selectPosition(pos) { selectedPosition.value = pos; posDropdownOpen.value = false }

function resetFilters() {
  searchQuery.value = ''
  selectedDepartment.value = 'all'
  selectedPosition.value = 'all'
}

function handleClickOutside(e) {
  if (deptSelectRef.value && !deptSelectRef.value.contains(e.target)) deptDropdownOpen.value = false
  if (posSelectRef.value && !posSelectRef.value.contains(e.target)) posDropdownOpen.value = false
}

const filteredEmployees = computed(() => {
  let result = search(searchQuery.value)
  result = filterByDepartment(selectedDepartment.value, result)
  result = filterByPosition(selectedPosition.value, result)
  return result
})

const visibleEmployees = computed(() => {
  return filteredEmployees.value.slice(0, visibleCount.value)
})

watch([searchQuery, selectedDepartment, selectedPosition], () => {
  visibleCount.value = itemsPerLoad
})

function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + itemsPerLoad, filteredEmployees.value.length)
    loading.value = false
  }, 300)
}

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMore()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

const totalCount = computed(() => employees.value.length)
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
          <div v-for="dept in departments" :key="dept" class="custom-select__option"
            @click.stop="selectDepartment(dept)">{{ dept }}</div>
        </div>
      </div>

      <div class="custom-select" @click="togglePositions" ref="posSelectRef">
        <div class="custom-select__trigger">
          <span>{{ selectedPositionLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="posDropdownOpen">
          <div class="custom-select__option" @click.stop="selectPosition('all')">Все должности</div>
          <div v-for="pos in allPositions" :key="pos" class="custom-select__option" @click.stop="selectPosition(pos)">{{
            pos }}</div>
        </div>
      </div>

      <div class="search-field">
        <input type="text" v-model="searchQuery" placeholder="Поиск">
        <img :src="searchIcon" alt="Поиск" class="search-icon">
      </div>

      <button class="reset-filters-btn" @click="resetFilters">Сбросить фильтры</button>
    </div>

    <div v-if="filteredEmployees.length === 0" class="empty-state">
      <p>Сотрудники не найдены</p>
      <p class="empty-hint">Попробуйте изменить параметры поиска или фильтры</p>
    </div>

    <div v-else>
      <div class="employees-grid">
        <EmployeeCard v-for="emp in visibleEmployees" :key="emp.id" :employee="emp" />
      </div>

      <div v-if="loading" class="loading-indicator">
        <div class="spinner"></div>
        <span>Загружаем ещё...</span>
      </div>

      <div v-else-if="!hasMore && visibleEmployees.length > 0" class="end-message">
        {{ visibleEmployees.length }} из {{ totalCount }} сотрудников
      </div>

      <div v-if="hasMore && !loading" class="load-more-btn-container">
        <button class="load-more-btn" @click="loadMore">Показать ещё</button>
      </div>
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
  background: var(--surface);
  box-shadow: var(--shadow-soft);
  border: none;
  border-radius: 60px;
  cursor: pointer;
  user-select: none;
  color: var(--text);
}

.custom-select__trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  background: var(--surface);
  color: var(--text);
  border-radius: 60px;
  font-size: 1rem;
}

.custom-select__trigger span {
  color: var(--text);
}

.custom-select__arrow {
  font-size: 0.75rem;
  color: var(--muted);
}

.custom-select__options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: var(--surface);
  box-shadow: var(--shadow-strong);
  border-radius: 24px;
  overflow: hidden;
  z-index: 20;
}

.custom-select__option {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  color: var(--text);
  background: var(--surface);
}

.custom-select__option:hover {
  background: var(--hover);
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
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}

.search-field input::placeholder {
  color: var(--muted);
}

.search-field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--border);
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
  background: var(--button-bg);
  color: var(--button-text);
  border: 1px solid var(--border);
  border-radius: 60px;
  padding: 0.9rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters-btn:hover {
  background: var(--button-hover);
}

.employees-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  background: var(--surface);
  color: var(--muted);
  border-radius: 32px;
  padding: 3rem;
  font-size: 1.2rem;
  box-shadow: var(--shadow-soft);
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: var(--muted);
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--muted);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border);
  border-top-color: var(--button-bg);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.end-message {
  text-align: center;
  padding: 2rem;
  color: var(--muted);
  font-size: 0.9rem;
}

.load-more-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 60px;
  padding: 0.8rem 2rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.load-more-btn:hover {
  background: var(--button-bg);
  color: var(--button-text);
}

.results-info {
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted);
  margin-bottom: 1.5rem;
}

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

  .custom-select,
  .search-field {
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