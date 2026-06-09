<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import EmployeeFormModal from '../components/EmployeeFormModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

import editIcon from '../assets/icons/edit.svg'
import trashIcon from '../assets/icons/trash.svg'
import searchIcon from '../assets/icons/search.svg'

const { employees, departments, filterByDepartment, filterByPosition, remove, formatDate, exportToCSV } = useEmployees()

// Фильтры
const deptFilter = ref('all')
const posFilter = ref('all')
const searchQuery = ref('')
const deptFilterOpen = ref(false)
const posFilterOpen = ref(false)
const deptFilterRef = ref(null)
const posFilterRef = ref(null)

const allPositions = computed(() => [...new Set(employees.value.map(emp => emp.position))])
const selectedDeptLabel = computed(() => deptFilter.value === 'all' ? 'Все отделы' : deptFilter.value)
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
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// Фильтрация
const filteredEmployees = computed(() => {
  let list = employees.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(emp =>
      emp.fullName.toLowerCase().includes(q) ||
      emp.position.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    )
  }
  list = filterByDepartment(deptFilter.value, list)
  list = filterByPosition(posFilter.value, list)
  return list
})

function exportFilteredCSV() {
  exportToCSV(filteredEmployees.value)
}

// Пагинация
const itemsPerPage = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage))
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredEmployees.value.slice(start, start + itemsPerPage)
})
function prevPage() { if (currentPage.value > 1) currentPage.value-- }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }

// Модалки
const showFormModal = ref(false)
const editingEmployee = ref(null)
const showConfirm = ref(false)
const employeeToDelete = ref(null)

function openAddModal() { editingEmployee.value = null; showFormModal.value = true }
function openEditModal(emp) { editingEmployee.value = emp; showFormModal.value = true }
function closeFormModal() { showFormModal.value = false; editingEmployee.value = null }
function requestDelete(emp) { employeeToDelete.value = emp; showConfirm.value = true }
function confirmDelete() { if (employeeToDelete.value) remove(employeeToDelete.value.id); showConfirm.value = false; employeeToDelete.value = null }
function cancelDelete() { showConfirm.value = false; employeeToDelete.value = null }
</script>

<template>
  <div class="admin-page">
    <!-- Панель фильтров и поиска -->
    <div class="admin-filters">
      <div class="custom-select" @click="toggleDeptFilter" ref="deptFilterRef">
        <div class="custom-select__trigger">
          <span>{{ selectedDeptLabel }}</span>
          <span class="custom-select__arrow">▼</span>
        </div>
        <div class="custom-select__options" v-if="deptFilterOpen">
          <div class="custom-select__option" @click.stop="setDeptFilter('all')">Все отделы</div>
          <div v-for="d in departments" :key="d" class="custom-select__option" @click.stop="setDeptFilter(d)">{{ d }}
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
          <div v-for="p in allPositions" :key="p" class="custom-select__option" @click.stop="setPosFilter(p)">{{ p }}
          </div>
        </div>
      </div>

      <div class="search-field">
        <input type="text" v-model="searchQuery" placeholder="Поиск">
        <img :src="searchIcon" alt="Поиск" class="search-icon-img">
      </div>

      <button class="reset-filters-btn" @click="resetFilters">Сбросить фильтры</button>
      <button class="export-btn" @click="exportFilteredCSV">Экспорт CSV</button>
    </div>

    <!-- Таблица сотрудников -->
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
              <th>Телефон</th>
              <th>Дата приёма</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in paginatedEmployees" :key="emp.id">
              <td class="photo-cell">
                <img v-if="emp.photo" :src="emp.photo" class="table-avatar">
                <div v-else class="no-avatar"></div>
              </td>
              <td><strong>{{ emp.fullName }}</strong></td>
              <td>{{ emp.position }}</td>
              <td>{{ emp.department }}</td>
              <td>{{ emp.email }}</td>
              <td>{{ emp.phone }}</td>
              <td>{{ formatDate(emp.hireDate) }}</td>
              <td class="actions-cell">
                <button @click="openEditModal(emp)" class="action-icon edit" title="Редактировать">
                  <img :src="editIcon" alt="Редактировать">
                </button>
                <button @click="requestDelete(emp)" class="action-icon delete" title="Удалить">
                  <img :src="trashIcon" alt="Удалить">
                </button>
              </td>
            </tr>
            <tr v-if="filteredEmployees.length === 0">
              <td colspan="8" class="empty-row">Нет сотрудников</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div class="pagination" v-if="totalPages > 1">
        <button @click="prevPage" :disabled="currentPage === 1">←</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">→</button>
      </div>
    </div>

    <!-- FAB-кнопка -->
    <button class="fab" @click="openAddModal">+</button>

    <!-- Модалки -->
    <EmployeeFormModal v-if="showFormModal" :employee="editingEmployee" @close="closeFormModal" />
    <ConfirmModal v-if="showConfirm" title="Удаление сотрудника" message="Вы уверены?" @confirm="confirmDelete"
      @cancel="cancelDelete" />
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
  background: white;
  border: none;
  border-radius: 60px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.custom-select__option {
  padding: 0.8rem 1.5rem;
  cursor: pointer;
}

.custom-select__option:hover {
  background: #f1f5f9;
}

/* Поиск */
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 1rem;
}

.search-field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #e3e3e3;
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

/* Кнопки */
.reset-filters-btn,
.export-btn {
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 60px;
  padding: 0.9rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-filters-btn:hover,
.export-btn:hover {
  background: #000000;
}

.admin-table-wrapper {
  background: white;
  border-radius: 32px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.admin-table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table th,
.admin-table td {
  padding: 1rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid #eef2f6;
  vertical-align: middle;
}

.admin-table th {
  font-weight: 600;
  color: #475569;
}

.table-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.no-avatar {
  width: 48px;
  height: 48px;
  background: #e2e8f0;
  border-radius: 50%;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icon img {
  width: 20px;
  height: 20px;
  display: block;
}

.action-icon.edit:hover {
  background: #dbeafe;
}

.action-icon.delete:hover {
  background: #fee2e2;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  align-items: center;
}

.pagination button {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 40px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
}

/* FAB-кнопка */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  background: #000;
}

/* Адаптивность */
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
  background: white;
  border-radius: 32px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.admin-table-container {
  overflow-x: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* Ширина колонок */
.admin-table th:nth-child(1),
.admin-table td:nth-child(1) {
  width: 70px;
  text-align: center;
}

.admin-table th:nth-child(2),
.admin-table td:nth-child(2) {
  width: 200px;
}

.admin-table th:nth-child(3),
.admin-table td:nth-child(3) {
  width: 180px;
}

.admin-table th:nth-child(4),
.admin-table td:nth-child(4) {
  width: 140px;
}

.admin-table th:nth-child(5),
.admin-table td:nth-child(5) {
  width: 200px;
}

.admin-table th:nth-child(6),
.admin-table td:nth-child(6) {
  width: 140px;
}

.admin-table th:nth-child(7),
.admin-table td:nth-child(7) {
  width: 110px;
  text-align: center;
}

.admin-table th:nth-child(8),
.admin-table td:nth-child(8) {
  width: 90px;
  text-align: center;
}

.admin-table th,
.admin-table td {
  padding: 1rem 0.6rem;
  border-bottom: 1px solid #eef2f6;
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Для email и телефона - можно переносить */
.admin-table td:nth-child(5),
.admin-table td:nth-child(6) {
  white-space: normal;
  word-break: break-all;
}

.admin-table th {
  font-weight: 600;
  color: #475569;
  background: #fafbfc;
}

/* Фото */
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

.no-avatar {
  width: 40px;
  height: 40px;
  background: #e2e8f0;
  border-radius: 50%;
  margin: 0 auto;
}

/* Действия */
.actions-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
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

.action-icon.edit:hover {
  background: #dbeafe;
}

.action-icon.delete:hover {
  background: #fee2e2;
}

/* Адаптивность для маленьких экранов */
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
  box-shadow: var(--shadow-soft);
}

.admin-table th {
  color: var(--muted);
  background: var(--surface-alt);
}

.admin-table th,
.admin-table td {
  border-bottom: 1px solid var(--border);
}

.no-avatar {
  background: var(--avatar-placeholder);
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