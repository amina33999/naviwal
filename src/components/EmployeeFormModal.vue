<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import { useEmployees } from '../composables/useEmployees'
import closeIcon from '../assets/icons/close.svg'

const props = defineProps({ employee: Object })
const emit = defineEmits(['close'])
const { add, update, departments } = useEmployees()

const form = reactive({
  fullName: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  hireDate: '',
  bio: '',
  photo: null
})

const photoPreview = ref(null)
const errors = ref({})
const generalError = ref('')

const customDept = ref('')
const customPos = ref('')

onMounted(() => {
  if (props.employee) {
    Object.assign(form, props.employee)
    photoPreview.value = props.employee.photo || null
  }
})

function clearError(field) {
  if (errors.value[field]) delete errors.value[field]
  generalError.value = ''
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => {
    form.photo = ev.target.result
    photoPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function removePhoto() {
  form.photo = null
  photoPreview.value = null
}

function validate() {
  errors.value = {}
  generalError.value = ''

  if (!form.fullName.trim()) {
    errors.value.fullName = 'ФИО обязательно для заполнения'
  } else if (form.fullName.trim().length < 5) {
    errors.value.fullName = 'ФИО должно содержать минимум 5 символов'
  }

  if (!form.position.trim()) {
    errors.value.position = 'Введите или выберите должность'
  }

  if (!form.department.trim()) {
    errors.value.department = 'Введите или выберите отдел'
  }

  if (!form.email.trim()) {
    errors.value.email = 'Email обязателен'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.value.email = 'Введите корректный email'
  }

  if (!form.phone.trim()) {
  errors.value.phone = 'Телефон обязателен'
  } else if (form.phone.replace(/\D/g, '').length !== 11) {
  errors.value.phone = 'Введите корректный номер из 11 цифр'
  }

  if (!form.hireDate) {
    errors.value.hireDate = 'Дата приёма обязательна'
  } else {
    const today = new Date()
    today.setHours(0,0,0,0)
    const hire = new Date(form.hireDate)
    if (hire > today) {
      errors.value.hireDate = 'Дата приёма не может быть в будущем'
    }
  }

  return Object.keys(errors.value).length === 0
}

function submit() {
  if (!validate()) return
  const employeeData = { ...form }
  try {
    if (props.employee) {
      update(props.employee.id, employeeData)
    } else {
      add(employeeData)
    }
    emit('close')
  } catch (err) {
    generalError.value = 'Ошибка при сохранении. Попробуйте снова.'
  }
}

function close() {
  emit('close')
}

const allPositions = computed(() => {
  const positions = useEmployees().employees.value.map(emp => emp.position)
  return [...new Set(positions)]
})

function formatPhone(value) {
  let cleaned = value.replace(/\D/g, '')
  if (cleaned.length > 11) cleaned = cleaned.slice(0, 11)
  
  if (cleaned.length === 0) return ''
  if (cleaned[0] === '8') cleaned = '7' + cleaned.slice(1)
  if (cleaned[0] !== '7') cleaned = '7' + cleaned
  
  let result = '+7'
  if (cleaned.length > 1) result += ' (' + cleaned.slice(1, 4)
  if (cleaned.length >= 5) result += ') ' + cleaned.slice(4, 7)
  if (cleaned.length >= 8) result += '-' + cleaned.slice(7, 9)
  if (cleaned.length >= 10) result += '-' + cleaned.slice(9, 11)
  
  return result
}

function onPhoneInput(e) {
  const raw = e.target.value
  const cursorPos = e.target.selectionStart
  const oldLength = raw.length
  const formatted = formatPhone(raw)
  form.phone = formatted
  
  setTimeout(() => {
    const newLength = formatted.length
    const diff = newLength - oldLength
    e.target.selectionStart = e.target.selectionEnd = cursorPos + diff
  }, 0)
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @click.self="close">
      <div class="modal-container">
        <div class="modal-title">
          <h2>{{ employee ? 'Редактировать сотрудника' : 'Добавить сотрудника' }}</h2>
          <button class="close-icon" @click="close"><img :src="closeIcon" alt="Закрыть"></button>
        </div>
        <form @submit.prevent="submit">
          <div class="form-grid">
            <div class="field full-width">
              <label>ФИО *</label>
              <input v-model="form.fullName" type="text" @input="clearError('fullName')" placeholder="Иванов Иван Иванович">
              <span v-if="errors.fullName" class="error">{{ errors.fullName }}</span>
            </div>
            
            <!-- ДОЛЖНОСТЬ - комбинированный список (можно выбрать ИЛИ вписать) -->
            <div class="field">
              <label>Должность *</label>
              <div class="combobox">
                <input 
                  type="text"
                  v-model="form.position"
                  list="positions-list"
                  @input="clearError('position')"
                  placeholder="Выберите или введите должность"
                  autocomplete="off"
                >
                <datalist id="positions-list">
                  <option v-for="pos in allPositions" :key="pos" :value="pos"></option>
                </datalist>
              </div>
              <span v-if="errors.position" class="error">{{ errors.position }}</span>
            </div>
            
            <!-- ОТДЕЛ - комбинированный список (можно выбрать ИЛИ вписать) -->
            <div class="field">
              <label>Отдел *</label>
              <div class="combobox">
                <input 
                  type="text"
                  v-model="form.department"
                  list="departments-list"
                  @input="clearError('department')"
                  placeholder="Выберите или введите отдел"
                  autocomplete="off"
                >
                <datalist id="departments-list">
                  <option v-for="dept in departments" :key="dept" :value="dept"></option>
                </datalist>
              </div>
              <span v-if="errors.department" class="error">{{ errors.department }}</span>
            </div>
            
            <div class="field">
              <label>Email *</label>
              <input type="email" v-model="form.email" @input="clearError('email')" placeholder="example@company.com">
              <span v-if="errors.email" class="error">{{ errors.email }}</span>
            </div>
            
            <div class="field">
              <label>Телефон *</label>
              <input
              type="text" :value="form.phone" @input="onPhoneInput" @blur="clearError('phone')" placeholder="+7 (999) 999-99-99" maxlength="18">
              
              <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
            </div>
            
            <div class="field">
              <label>Дата приёма *</label>
              <input type="date" v-model="form.hireDate" @change="clearError('hireDate')">
              <span v-if="errors.hireDate" class="error">{{ errors.hireDate }}</span>
            </div>
            
            <div class="field full-width">
              <label>Фото</label>
              <input type="file" accept="image/*" @change="onFileChange">
              <div v-if="photoPreview" class="photo-preview">
                <img :src="photoPreview">
                <button type="button" class="remove-photo" @click="removePhoto">✕</button>
              </div>
            </div>
            
            <div class="field full-width">
              <label>Биография</label>
              <textarea v-model="form.bio" rows="3" placeholder="Краткая информация о сотруднике..."></textarea>
            </div>
          </div>
          
          <div v-if="generalError" class="error general">{{ generalError }}</div>
          
          <div class="modal-actions">
            <button type="submit" class="btn-save">Сохранить</button>
            <button type="button" class="btn-cancel" @click="close">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.close-icon img {
  width: 20px;
  height: 20px;
  display: block;
}

.modal-backdrop {
  position: fixed;
  top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 720px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 1.8rem;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-icon {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.full-width {
  grid-column: span 2;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field label {
  font-weight: 500;
}

.field input, .field select, .field textarea {
  padding: 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-family: inherit;
}

/* Комбинированный список - одна строка */
.combobox {
  width: 100%;
}

.combobox input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-family: inherit;
}

.combobox input:focus {
  outline: none;
  border-color: #0f172a;
}

.photo-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.photo-preview img {
  max-width: 80px;
  border-radius: 12px;
}

.remove-photo {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 1rem;
}

.error {
  color: #ef4444;
  font-size: 0.7rem;
  margin-top: 0.2rem;
  display: block;
}

.error.general {
  text-align: center;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-save, .btn-cancel {
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  cursor: pointer;
}

.btn-save {
  background: #0f172a;
  color: white;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

@media (max-width: 640px) {
  .modal-container {
    padding: 1.2rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
}
</style>