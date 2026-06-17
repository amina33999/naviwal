<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEmployees } from '../composables/useEmployees' 

const router = useRouter()
const { login } = useEmployees() 

const form = reactive({ username: '', password: '' })
const errors = ref({})
const showPrivateNotice = ref(false) // Состояние для показа уведомления о закрытой регистрации

function clearError(field) {
  delete errors.value[field]
}

function handleRegistrationClick() {
  // Вместо переключения режима включаем плашку с предупреждением
  showPrivateNotice.value = true
  errors.value = {}
}

function validate() {
  errors.value = {}
  const username = form.username.trim()
  const password = form.password.trim()

  if (!username) {
    errors.value.username = 'Введите логин'
  } else if (/\s/.test(username)) {
    errors.value.username = 'Логин не должен содержать пробелы'
  }

  if (!password) {
    errors.value.password = 'Введите пароль'
  } else if (/\s/.test(password)) {
    errors.value.password = 'Пароль не должен содержать пробелы'
  }

  return Object.keys(errors.value).length === 0
}

async function handleFormSubmit() {
  if (!validate()) return
  
  const username = form.username.trim()
  const password = form.password.trim()
  
  const success = await login(username, password)
  if (success) {
    try {
      await router.push({ name: 'Admin' })
    } catch (routeError) {
      console.warn("Маршрут 'Admin' не найден, пробуем 'admin'", routeError)
      await router.push({ path: '/admin' })
    }
  } else {
    errors.value.general = 'Неверный логин или пароль'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Вход для HR-отдела</h2>
      
      <div v-if="showPrivateNotice" class="private-notice animate-fade">
        <div class="notice-header">
          <strong>Доступ ограничен</strong>
          <button class="close-notice" @click="showPrivateNotice = false">×</button>
        </div>
        <p>Это закрытая корпоративная система. Самостоятельная регистрация невозможна. Обратитесь к системному администратору для получения учётной записи.</p>
      </div>

      <form @submit.prevent="handleFormSubmit">
        <div class="field">
          <label>Логин</label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="Введите логин"
            @input="clearError('username')"
          >
          <span v-if="errors.username" class="error">{{ errors.username }}</span>
        </div>
        <div class="field">
          <label>Пароль</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="Введите пароль"
            @input="clearError('password')"
          >
          <span v-if="errors.password" class="error">{{ errors.password }}</span>
        </div>
        <div v-if="errors.general" class="error general">{{ errors.general }}</div>
        
        <button type="submit" class="btn-primary">Войти</button>
        
        <div class="toggle-mode-container">
          <a href="#" @click.prevent="handleRegistrationClick" class="toggle-mode-link">
            Нет аккаунта? Создать
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: var(--bg);
}

.login-card {
  background: var(--surface);
  color: var(--text);
  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-soft);
  position: relative;
}

.login-card h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text);
}

/* СТИЛИ ДЛЯ ПЛАШКИ О КОРПОРАТИВНОЙ ПРИВАТНОСТИ */
.private-notice {
  background: #fff5f5;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.notice-header strong {
  font-weight: 600;
  color: #7f1d1d;
}

.close-notice {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #991b1b;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.25rem;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: var(--text);
}

.field input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  font-size: 0.95rem;
  background: var(--surface);
  color: var(--text);
}

.field input::placeholder {
  color: var(--muted);
}

.field input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--border);
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: var(--button-bg);
  color: var(--button-text);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  margin-top: 0.5rem;
}

.btn-primary:hover {
  background: var(--button-hover);
}

.error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.error.general {
  text-align: center;
  margin-bottom: 1rem;
}

.toggle-mode-container {
  text-align: center;
  margin-top: 1.25rem;
}

.toggle-mode-link {
  color: var(--muted);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.toggle-mode-link:hover {
  color: var(--text);
}

/* АНИМАЦИЯ ПОЯВЛЕНИЯ ПЛАШКИ */
.animate-fade {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>