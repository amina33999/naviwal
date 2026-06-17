import { ref, computed } from 'vue'

const ACTIVE_KEY = 'hr_active'
const API_URL = 'http://localhost:5000/api/auth/login'

// Загружаем сохраненную сессию, если она есть
const activeUser = ref(JSON.parse(localStorage.getItem(ACTIVE_KEY)) || null)

export function useAuth() {
  const isAuthenticated = computed(() => activeUser.value !== null)
  
  // Проверяем роль, которую прислал бэкенд (мы там заложили 'administrator')
  const isAdmin = computed(() => activeUser.value?.role === 'administrator' || false)

  async function login(username, password) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Сохраняем пользователя и фейк-токен в реактивное состояние
        activeUser.value = {
          username: data.user.username,
          role: data.user.role,
          token: data.token
        }
        
        // Дублируем в localStorage для сохранения сессии при перезагрузке
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeUser.value))
        
        // Триггерим событие для обновления компонентов
        window.dispatchEvent(new Event('auth-update'))
        
        return { success: true, message: data.message }
      } else {
        // Сервер вернул ошибку (401 или 400)
        return { success: false, message: data.message || 'Ошибка авторизации' }
      }
    } catch (error) {
      console.error('Ошибка сети при авторизации:', error)
      return { success: false, message: 'Не удалось связаться с сервером.' }
    }
  }

  function logout() {
    activeUser.value = null
    localStorage.removeItem(ACTIVE_KEY)
    window.dispatchEvent(new Event('auth-update'))
  }

  return {
    isAuthenticated,
    isAdmin,
    login,
    logout,
    activeUser
  }
}