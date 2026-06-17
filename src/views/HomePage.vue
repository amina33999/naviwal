<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import EmployeeCard from '../components/EmployeeCard.vue'
import searchIcon from '../assets/icons/search.svg'
import userPlug from "../assets/icons/userPlug.png"

const { 
  employees, 
  departments, 
  loadEmployees,
  formatDate 
} = useEmployees()

const searchQuery = ref('')
const selectedDepartment = ref('all')
const selectedPosition = ref('all')

const deptDropdownOpen = ref(false)
const posDropdownOpen = ref(false)
const deptSelectRef = ref(null)
const posSelectRef = ref(null)

const itemsPerLoad = 6
const visibleCount = ref(itemsPerLoad)
const loading = ref(false)

// СОСТОЯНИЕ ДЛЯ ДЕТАЛЬНОГО ПРОСМОТРА СОТРУДНИКА
const selectedEmployeeForView = ref(null)

function openDetailModal(emp) {
  selectedEmployeeForView.value = emp
}

function closeDetailModal() {
  selectedEmployeeForView.value = null
}

// Лейблы для кастомных селектов
const selectedDepartmentLabel = computed(() => {
  if (selectedDepartment.value === 'all') return 'Все отделы'
  const found = departments.value.find(d => String(d.id) === String(selectedDepartment.value))
  return found ? found.name : 'Все отделы'
})

const selectedPositionLabel = computed(() => selectedPosition.value === 'all' ? 'Все должности' : selectedPosition.value)

// Собираем уникальные должности по текущему списку
const allPositions = computed(() => {
  const list = employees.value && Array.isArray(employees.value) ? employees.value : []
  return [...new Set(list.map(emp => emp.position).filter(Boolean))]
})

function toggleDepartments() { deptDropdownOpen.value = !deptDropdownOpen.value; posDropdownOpen.value = false }
function togglePositions() { posDropdownOpen.value = !posDropdownOpen.value; deptDropdownOpen.value = false }

function selectDepartment(deptId) { selectedDepartment.value = deptId; deptDropdownOpen.value = false }
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

// Фильтрация по Поиску и Отделам ушла на бэкенд. 
// Позиции фильтруем локально поверх отданного сервером результата.
const filteredEmployees = computed(() => {
  let result = employees.value && Array.isArray(employees.value) ? [...employees.value] : []
  
  if (selectedPosition.value !== 'all') {
    result = result.filter(emp => emp.position === selectedPosition.value)
  }
  
  return result
})

const visibleEmployees = computed(() => {
  const currentFiltered = filteredEmployees.value || []
  return currentFiltered.slice(0, visibleCount.value)
})

const hasMore = computed(() => {
  const currentFiltered = filteredEmployees.value || []
  return visibleCount.value < currentFiltered.length
})

let timeoutId = null

// WATCH: Делает запрос на бэкенд при вводе текста или смене отдела
watch([searchQuery, selectedDepartment], () => {
  visibleCount.value = itemsPerLoad
  
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    loadEmployees({
      search: searchQuery.value,
      department: selectedDepartment.value
    })
  }, 300)
})

watch(selectedPosition, () => {
  visibleCount.value = itemsPerLoad
})

function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  setTimeout(() => {
    const totalLength = filteredEmployees.value ? filteredEmployees.value.length : 0
    visibleCount.value = Math.min(visibleCount.value + itemsPerLoad, totalLength)
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

onMounted(async () => {
  await loadEmployees()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})

const totalCount = computed(() => (employees.value && Array.isArray(employees.value)) ? employees.value.length : 0)
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
          <div 
            v-for="dept in departments" 
            :key="dept.id" 
            class="custom-select__option"
            @click.stop="selectDepartment(dept.id)"
          >
            {{ dept.name }}
          </div>
        </div>
      </div>

      <div class="custom-select" @click="togglePositions" ref="posSelectRef">
        <div class="custom-select__trigger">
          <span>{{ selectedPositionLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="posDropdownOpen">
          <div class="custom-select__option" @click.stop="selectPosition('all')">Все должности</div>
          <div 
            v-for="pos in allPositions" 
            :key="pos" 
            class="custom-select__option" 
            @click.stop="selectPosition(pos)"
          >
            {{ pos }}
          </div>
        </div>
      </div>

      <div class="search-field">
        <input type="text" v-model="searchQuery" placeholder="Поиск">
        <img :src="searchIcon" alt="Поиск" class="search-icon">
      </div>

      <button class="reset-filters-btn" @click="resetFilters">Сбросить фильтры</button>
    </div>

    <div v-if="!filteredEmployees || filteredEmployees.length === 0" class="empty-state">
      <p>Сотрудники не найдены</p>
      <p class="empty-hint">Попробуйте изменить параметры поиска или фильтры</p>
    </div>

    <div v-else>
      <div class="employees-grid">
        <EmployeeCard 
          v-for="emp in visibleEmployees" 
          :key="emp.id" 
          :employee="emp" 
          @click="openDetailModal(emp)"
          style="cursor: pointer;"
        />
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

    <div v-if="selectedEmployeeForView" class="detail-backdrop" @click.self="closeDetailModal">
      <div class="detail-card">
        <button class="close-detail-btn" @click="closeDetailModal">×</button>
        
        <div class="detail-header">
          <img :src="selectedEmployeeForView.photo_url || userPlug" class="detail-avatar" alt="Аватар" />
          <div class="detail-title-info">
            <h2>{{ selectedEmployeeForView.name }}</h2>
            <p class="detail-position">{{ selectedEmployeeForView.position }}</p>
            <span class="detail-dept-badge">{{ selectedEmployeeForView.department_name || 'Не указан' }}</span>
          </div>
        </div>

        <div class="detail-body">
          <div class="detail-info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">{{ selectedEmployeeForView.email || '-' }}</span>
          </div>
          
          <div class="detail-info-row">
            <span class="info-label">Внутренний телефон:</span>
            <span class="info-value phone-highlight">{{ selectedEmployeeForView.phone || '-' }}</span>
          </div>

          <div class="detail-info-row">
            <span class="info-label">Дата приёма:</span>
            <span class="info-value">{{ selectedEmployeeForView.hire_date ? formatDate(selectedEmployeeForView.hire_date) : '-' }}</span>
          </div>

          <div class="detail-bio-section">
            <h3>О сотруднике / Обязанности</h3>
            <p class="bio-text">{{ selectedEmployeeForView.bio || 'Информация не указана.' }}</p>
          </div>
        </div>
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

/* СТИЛИ ДЛЯ ДЕТАЛЬНОЙ МОДАЛКИ С СОТРУДНИКОМ */
.detail-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
  backdrop-filter: blur(5px);
}

.detail-card {
  background: var(--surface);
  color: var(--text);
  border-radius: 2rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-strong);
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}

.close-detail-btn {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--muted);
  cursor: pointer;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}

.detail-title-info h2 {
  font-size: 1.4rem;
  margin: 0 0 0.3rem 0;
}

.detail-position {
  color: var(--muted);
  font-weight: 500;
  margin: 0 0 0.6rem 0;
}

.detail-dept-badge {
  background: var(--surface-alt);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.detail-info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--border-soft);
  font-size: 0.95rem;
}

.info-label {
  color: var(--muted);
}

.info-value {
  font-weight: 500;
}

.phone-highlight {
  color: var(--button-bg);
  font-weight: 600;
}

.detail-bio-section {
  margin-top: 1.5rem;
  background: var(--surface-alt);
  padding: 1.2rem;
  border-radius: 1rem;
}

.detail-bio-section h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.bio-text {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
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
  
  .detail-card {
    padding: 1.5rem;
    max-width: 90%;
  }
  
  .detail-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>