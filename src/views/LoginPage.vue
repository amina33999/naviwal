<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const form = reactive({ username: '', password: '' })
const errors = ref({})

function clearError(field) {
  delete errors.value[field]
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

async function handleLogin() {
  if (!validate()) return
  
  const username = form.username.trim()
  const password = form.password.trim()
  
  console.log('Попытка входа:', username, password) // для отладки
  
  const success = login(username, password)
  
  if (success) {
    console.log('Успешный вход')
    router.push({ name: 'Admin' })
  } else {
    errors.value.general = 'Неверный логин или пароль'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2>Вход для HR-отдела</h2>
      <form @submit.prevent="handleLogin">
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

/* карточка */
.login-card {
  background: var(--surface);
  color: var(--text);

  padding: 2rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;

  box-shadow: var(--shadow-soft);
}

.login-card h2 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text);
}

/* поля */
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

/* кнопка */
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
}

.btn-primary:hover {
  background: var(--button-hover);
}

/* ошибки */
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

/* маленькая адаптация */
@media (max-width: 640px) {
  .login-card {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>