<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import userPlug from "../assets/icons/userPlug.png"

const props = defineProps({
  employee: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const { add, update, departments, uploadPhoto } = useEmployees()

// Инициализируем реактивную форму со всеми полями из ТЗ
const form = reactive({
  name: '',
  position: '',
  department_id: '',
  salary: '',
  email: '',
  phone: '',       // ТЗ: внутренний телефон
  hire_date: '',   // ТЗ: дата приёма
  bio: '',         // ТЗ: краткая биография
  photo_url: ''    // ТЗ: аватар сотрудника
})

const errors = ref({})
const isUploading = ref(false) // Индикатор загрузки картинки на бэкенд

onMounted(() => {
  // Если передали объект сотрудника — мы в режиме редактирования
  if (props.employee) {
    form.name = props.employee.name || ''
    form.position = props.employee.position || ''
    form.department_id = props.employee.department_id || ''
    form.salary = props.employee.salary || ''
    form.email = props.employee.email || ''
    form.phone = props.employee.phone || ''
    form.hire_date = props.employee.hire_date || ''
    form.bio = props.employee.bio || ''
    form.photo_url = props.employee.photo_url || ''
  } else {
    // Дефолтное значение для нового сотрудника (первый отдел из списка)
    if (departments.value.length > 0) {
      form.department_id = departments.value[0].id
    }
  }
})

// Обработчик выбора файла фотографии
async function handlePhotoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  // Вызываем метод отправки файла на бэкенд из нашего композибла
  const uploadedUrl = await uploadPhoto(file)
  isUploading.value = false

  if (uploadedUrl) {
    form.photo_url = uploadedUrl
  } else {
    errors.value.photo = 'Не удалось загрузить изображение'
  }
}

function validate() {
  errors.value = {}
  if (!form.name.trim()) errors.value.name = 'Введите ФИО'
  if (!form.position.trim()) errors.value.position = 'Введите должность'
  if (!form.department_id) errors.value.department_id = 'Выберите отдел'
  
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Некорректный формат email'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  const payload = {
    name: form.name.trim(),
    position: form.position.trim(),
    department_id: Number(form.department_id),
    salary: form.salary ? Number(form.salary) : null,
    email: form.email.trim(),
    phone: form.phone.trim(),
    hire_date: form.hire_date,
    bio: form.bio.trim(),
    photo_url: form.photo_url
  }

  let success = false
  if (props.employee?.id) {
    success = await update(props.employee.id, payload)
  } else {
    success = await add(payload)
  }

  if (success) {
    emit('saved')
  }
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-card">
      <h3>{{ props.employee ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}</h3>
      
      <form @submit.prevent="handleSubmit" class="form-grid">
        
        <div class="photo-upload-section">
          <div class="avatar-preview-wrapper">
            <img :src="form.photo_url || userPlug" alt="Превью" class="avatar-preview" />
            <div v-if="isUploading" class="upload-loader">...</div>
          </div>
          <div class="upload-controls">
            <label class="file-input-label">
              <span>Загрузить фото</span>
              <input type="file" accept="image/*" @change="handlePhotoUpload" class="hidden-file-input" />
            </label>
            <span v-if="errors.photo" class="error">{{ errors.photo }}</span>
          </div>
        </div>

        <div class="field">
          <label>ФИО *</label>
          <input type="text" v-model="form.name" placeholder="Иванов Иван Иванович" />
          <span v-if="errors.name" class="error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label>Должность *</label>
          <input type="text" v-model="form.position" placeholder="HR-менеджер" />
          <span v-if="errors.password" class="error">{{ errors.position }}</span>
        </div>

        <div class="field">
          <label>Отдел *</label>
          <select v-model="form.department_id">
            <option v-for="d in departments" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
          <span v-if="errors.department_id" class="error">{{ errors.department_id }}</span>
        </div>

        <div class="field">
          <label>Рабочий Email</label>
          <input type="text" v-model="form.email" placeholder="example@company.com" />
          <span v-if="errors.email" class="error">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label>Внутренний телефон</label>
          <input type="text" v-model="form.phone" placeholder="104 или +7..." />
        </div>

        <div class="field">
          <label>Дата приёма на работу</label>
          <input type="date" v-model="form.hire_date" />
        </div>

        <div class="field full-width">
          <label>Зарплата (₽)</label>
          <input type="number" v-model="form.salary" placeholder="85000" />
        </div>

        <div class="field full-width">
          <label>Краткая биография / Обязанности</label>
          <textarea v-model="form.bio" rows="3" placeholder="Занимается подбором персонала и адаптацией новичков..."></textarea>
        </div>

        <div class="modal-actions full-width">
          <button type="button" class="btn-secondary" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn-primary" :disabled="isUploading">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: var(--surface);
  color: var(--text);
  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 550px;
  box-shadow: var(--shadow-strong);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-card h3 {
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.photo-upload-section {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--bg);
  padding: 1rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
}

.avatar-preview-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
}

.avatar-preview {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.upload-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
}

.file-input-label {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: 0.2s;
}

.file-input-label:hover {
  background: var(--hover-soft);
}

.hidden-file-input {
  display: none;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full-width {
  grid-column: span 2;
}

.field label {
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: var(--muted);
}

.field input,
.field select,
.field textarea {
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
}

.field textarea {
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--button-bg);
  box-shadow: 0 0 0 2px var(--border);
}

.error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.2rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.7rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: 0.2s;
}

.btn-primary {
  background: var(--button-bg);
  color: var(--button-text);
}

.btn-primary:hover {
  background: var(--button-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--surface-alt);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--hover-soft);
}

@media (max-width: 500px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .field.full-width,
  .photo-upload-section,
  .modal-actions {
    grid-column: span 1;
  }
}
</style>