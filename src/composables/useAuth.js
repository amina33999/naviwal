import { ref, computed } from 'vue'

const STORAGE_KEY = 'hr_users'
const ACTIVE_KEY = 'hr_active'

// Стандартный HR-пользователь
const defaultAdmin = {
  username: 'admin',
  password: 'admin',
  isAdmin: true
}

function initUsers() {
  const users = localStorage.getItem(STORAGE_KEY)
  if (!users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultAdmin]))
  }
}
initUsers()

const usersList = ref(JSON.parse(localStorage.getItem(STORAGE_KEY)) || [])
const activeUser = ref(JSON.parse(localStorage.getItem(ACTIVE_KEY)) || null)

export function useAuth() {
  const isAuthenticated = computed(() => activeUser.value !== null)
  const isAdmin = computed(() => activeUser.value?.isAdmin || false)

  function login(username, password) {
    // Ищем пользователя с точным совпадением логина и пароля
    const user = usersList.value.find(u => u.username === username && u.password === password)
    if (user) {
      activeUser.value = { ...user }
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeUser.value))
      // Триггерим событие для обновления других компонентов
      window.dispatchEvent(new Event('auth-update'))
      return true
    }
    return false
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
    logout
  }
}