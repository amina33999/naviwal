<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import EmployeeFormModal from '../components/EmployeeFormModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import userPlug from "../assets/icons/user-plug.png"
import editIcon from '../assets/icons/edit.svg'
import trashIcon from '../assets/icons/trash.svg'
import searchIcon from '../assets/icons/search.svg'

const { 
  employees, 
  departments, 
  remove, 
  formatDate, 
  exportToCSV,
  loadEmployees 
} = useEmployees()

const deptFilter = ref('all')
const posFilter = ref('all')
const searchQuery = ref('')
const deptFilterOpen = ref(false)
const posFilterOpen = ref(false)
const deptFilterRef = ref(null)
const posFilterRef = ref(null)

const itemsPerPage = 10
const currentPage = ref(1)

// Находим уникальные должности
const allPositions = computed(() => {
  const list = employees.value && Array.isArray(employees.value) ? employees.value : []
  return [...new Set(list.map(emp => emp.position).filter(Boolean))]
})

// Корректно отображаем текстовую метку выбранного отдела
const selectedDeptLabel = computed(() => {
  if (deptFilter.value === 'all') return 'Все отделы'
  const found = departments.value?.find(d => String(d.id) === String(deptFilter.value))
  return found ? found.name : 'Все отделы'
})
const selectedPosLabel = computed(() => posFilter.value === 'all' ? 'Все должности' : posFilter.value)

function toggleDeptFilter() { deptFilterOpen.value = !deptFilterOpen.value; posFilterOpen.value = false }
function togglePosFilter() { posFilterOpen.value = !posFilterOpen.value; deptFilterOpen.value = false }
function setDeptFilter(val) { deptFilter.value = val; deptFilterOpen.value = false }
function setPosFilter(val) { posFilter.value = val; posFilterOpen.value = false }

function resetFilters() {
  deptFilter.value = 'all'
  posFilter.value = 'all'
  searchQuery.value = ''
  currentPage.value = 1
}

function handleClickOutside(e) {
  if (deptFilterRef.value && !deptFilterRef.value.contains(e.target)) deptFilterOpen.value = false
  if (posFilterRef.value && !posFilterRef.value.contains(e.target)) posFilterOpen.value = false
}

// Поиск и отделы обрабатываются сервером. Должности дофильтровываем на клиенте.
const filteredEmployees = computed(() => {
  let result = employees.value && Array.isArray(employees.value) ? [...employees.value] : []
  
  if (posFilter.value !== 'all') {
    result = result.filter(emp => emp.position === posFilter.value)
  }
  
  return result
})

function exportFilteredCSV() {
  exportToCSV(filteredEmployees.value)
}

const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage) || 1)

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmployees.value.slice(start, start + itemsPerPage)
})

let timeoutId = null

// Главный WATCH: запрашивает данные у бэкенда при изменении строки поиска или отдела
watch([searchQuery, deptFilter], () => {
  currentPage.value = 1
  
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    loadEmployees({
      search: searchQuery.value,
      department: deptFilter.value
    })
  }, 300)
})

watch(posFilter, () => {
  currentPage.value = 1
})

function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

const showFormModal = ref(false)
const editingEmployee = ref(null)
const showConfirm = ref(false)
const employeeToDelete = ref(null)

function openAddModal() { editingEmployee.value = null; showFormModal.value = true }
function openEditModal(emp) { editingEmployee.value = { ...emp }; showFormModal.value = true }
function closeFormModal() { showFormModal.value = false; editingEmployee.value = null }

async function handleFormSaved() {
  closeFormModal()
  await loadEmployees({
    search: searchQuery.value,
    department: deptFilter.value
  })
}

function requestDelete(emp) { employeeToDelete.value = emp; showConfirm.value = true }
async function confirmDelete() { 
  if (employeeToDelete.value) {
    await remove(employeeToDelete.value.id)
  } 
  showConfirm.value = false; 
  employeeToDelete.value = null 
}
function cancelDelete() { showConfirm.value = false; employeeToDelete.value = null }

onMounted(async () => {
  await loadEmployees()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="admin-page">
    <div class="admin-filters">
      <div class="custom-select" @click="toggleDeptFilter" ref="deptFilterRef">
        <div class="custom-select__trigger">
          <span>{{ selectedDeptLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="deptFilterOpen">
          <div class="custom-select__option" @click.stop="setDeptFilter('all')">Все отделы</div>
          <div 
            v-for="d in departments" 
            :key="d.id" 
            class="custom-select__option" 
            @click.stop="setDeptFilter(d.id)"
          >
            {{ d.name }}
          </div>
        </div>
      </div>

      <div class="custom-select" @click="togglePosFilter" ref="posFilterRef">
        <div class="custom-select__trigger">
          <span>{{ selectedPosLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="posFilterOpen">
          <div class="custom-select__option" @click.stop="setPosFilter('all')">Все должности</div>
          <div v-for="p in allPositions" :key="p" class="custom-select__option" @click.stop="setPosFilter(p)">{{ p }}</div>
        </div>
      </div>

      <div class="search-field">
        <input type="text" v-model="searchQuery" placeholder="Поиск">
        <img :src="searchIcon" alt="Поиск" class="search-icon-img">
      </div>

      <button class="reset-filters-btn" @click="resetFilters">Сбросить фильтры</button>
      <button class="export-btn" @click="exportFilteredCSV">Экспорт CSV</button>
    </div>

    <div class="admin-table-wrapper">
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Отдел</th>
              <th>Email</th>
              <th>Зарплата</th>
              <th>Дата приёма</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in paginatedEmployees" :key="emp.id">
              <td class="photo-cell">
                <img :src="emp.photo_url || userPlug" class="table-avatar" alt="Фото сотрудника" />
              </td>
              <td><strong>{{ emp.name }}</strong></td>
              <td>{{ emp.position }}</td>
              <td>{{ emp.department_name || 'Не указан' }}</td>
              <td>{{ emp.email || '-' }}</td>
              <td>{{ emp.salary ? emp.salary.toLocaleString() + ' ₽' : '-' }}</td>
              <td>{{ emp.hire_date ? formatDate(emp.hire_date) : '-' }}</td>
              <td class="actions-cell">
                <div class="actions">
                  <button @click="openEditModal(emp)" class="action-icon edit">
                    <img :src="editIcon" alt="Редактировать">
                  </button>
                  <button @click="requestDelete(emp)" class="action-icon delete">
                    <img :src="trashIcon" alt="Удалить">
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredEmployees || filteredEmployees.length === 0">
              <td colspan="8" class="empty-row">Нет сотрудников</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">←</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">→</button>
      </div>
    </div>

    <button class="fab" @click="openAddModal">+</button>

    <EmployeeFormModal v-if="showFormModal" :employee="editingEmployee" @close="closeFormModal" @saved="handleFormSaved" />
    <ConfirmModal v-if="showConfirm" title="Удаление сотрудника" message="Вы уверены?" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<style scoped>
.admin-page {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-filters {
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
  border: none;
  border-radius: 60px;
  cursor: pointer;
  user-select: none;
}

.custom-select__trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.5rem;
  border-radius: 60px;
  font-size: 1rem;
}

.custom-select__arrow {
  font-size: 0.75rem;
}

.custom-select__options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  z-index: 20;
}

.custom-select__option {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
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
}

.search-field input:focus {
  outline: none;
}

.search-icon-img {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  display: block;
  opacity: 0.6;
}

.reset-filters-btn,
.export-btn {
  border: none;
  border-radius: 60px;
  padding: 0.9rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
}

.pagination button {
  border: 1px solid;
  border-radius: 40px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .custom-select,
  .search-field {
    max-width: none;
  }

  .reset-filters-btn,
  .export-btn {
    width: 100%;
    text-align: center;
  }

  .fab {
    width: 56px;
    height: 56px;
    font-size: 1.5rem;
    bottom: 1rem;
    right: 1rem;
  }
}

.admin-table-wrapper {
  border-radius: 32px;
  padding: 1.5rem;
}

.admin-table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.admin-table th:nth-child(1),
.admin-table td:nth-child(1) { width: 70px; text-align: center; }
.admin-table th:nth-child(2),
.admin-table td:nth-child(2) { width: 200px; }
.admin-table th:nth-child(3),
.admin-table td:nth-child(3) { width: 180px; }
.admin-table th:nth-child(4),
.admin-table td:nth-child(4) { width: 140px; }
.admin-table th:nth-child(5),
.admin-table td:nth-child(5) { width: 200px; }
.admin-table th:nth-child(6),
.admin-table td:nth-child(6) { width: 140px; }
.admin-table th:nth-child(7),
.admin-table td:nth-child(7) { width: 110px; text-align: center; }
.admin-table th:nth-child(8),
.admin-table td:nth-child(8) { width: 90px; text-align: center; }

.admin-table th,
.admin-table td {
  padding: 1rem 0.6rem;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-table td:nth-child(5),
.admin-table td:nth-child(6) {
  white-space: normal;
  word-break: break-all;
}

.admin-table th {
  font-weight: 600;
}

.photo-cell {
  text-align: center !important;
  padding: 0.5rem !important;
}

.table-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.actions-cell {
  text-align: center;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-icon img {
  width: 18px;
  height: 18px;
  display: block;
}

@media (max-width: 1200px) {
  .admin-table {
    min-width: 1000px;
  }
}

.custom-select {
  background: var(--surface);
  box-shadow: var(--shadow-soft);
}

.custom-select__trigger {
  background: var(--surface);
  color: var(--text);
}

.custom-select__options {
  background: var(--surface);
  box-shadow: var(--shadow-strong);
}

.custom-select__option:hover {
  background: var(--hover-soft);
}

.search-field input {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}

.search-field input::placeholder {
  color: var(--muted);
}

.reset-filters-btn,
.export-btn {
  background: var(--button-bg);
  color: var(--button-text);
}

.reset-filters-btn:hover,
.export-btn:hover {
  background: var(--button-hover);
}

.admin-table-wrapper {
  background: var(--surface);
  border-radius: 32px;
  box-shadow: var(--shadow-soft);
  overflow: hidden;
}

.admin-table th {
  color: var(--muted);
  background: var(--surface-alt);
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid var(--border);
}

.pagination button {
  background: var(--pagination-bg);
  border-color: var(--border-strong);
  color: var(--text);
}

.fab {
  background: var(--button-bg);
  color: var(--button-text);
}

.fab:hover {
  background: var(--button-hover);
}

.action-icon.edit:hover {
  background: var(--edit-hover);
}

.action-icon.delete:hover {
  background: var(--delete-hover);
}
</style>