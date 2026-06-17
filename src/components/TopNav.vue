<script setup>
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { darkTheme, toggleTheme } from "../composables/useTheme";
import lightThemeIcon from "../assets/icons/lightTheme.svg";
import darkThemeIcon from "../assets/icons/darkTheme.svg"

const router = useRouter();
const { isAuthenticated, isAdmin, logout } = useAuth();

function goToHome() {
  router.push({ name: "Home" });
}
function goToAdmin() {
  router.push({ name: "Admin" });
}
function goToLogin() {
  router.push({ name: "Login" });
}
function handleLogout() {
  logout();
  router.push({ name: "Home" });
}

console.log(lightThemeIcon, darkThemeIcon)
</script>

<template>
  <header class="topnav">
    <!-- Левая часть: логотип -->
    <div class="topnav__logo" @click="goToHome">
      <img src="../assets/icons/logo.png" alt="Logo" class="logo-img">
      <img src="../assets/лого_текст.svg" alt="Logo SVG" class="logo-svg">
    </div>

    <div class="topnav__center">
      <div class="topnav__buttons">
        <button @click="goToHome" class="nav-btn" :class="{ active: $route.name === 'Home' }">
          Сотрудники
        </button>
        <button v-if="isAdmin" @click="goToAdmin" class="nav-btn" :class="{ active: $route.name === 'Admin' }">
          HR-панель
        </button>
      </div>

      <div class="topnav__auth">
        <button @click="toggleTheme" class="theme-btn" :title="darkTheme ? 'Светлая тема' : 'Тёмная тема'">
          <img :src="darkTheme ? lightThemeIcon : darkThemeIcon" alt="theme icon" class="theme-icon" />
        </button>
        

        <div v-if="!isAuthenticated">
          <button @click="goToLogin" class="btn-outline">Вход</button>
        </div>
        <div v-else>
          <span class="user"></span>
          <button @click="handleLogout" class="btn-outline small">Выйти</button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.logo-img {
  height: 70px;
}

.topnav {
  background: #000000;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  flex-wrap: wrap;
  height: 100px;
  box-sizing: border-box;
}

/* Логотип */
.topnav__logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-icon {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.brand {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
}

.sub {
  font-size: 0.7rem;
  opacity: 0.7;
  color: white;
}

/* Кнопки навигации */
.topnav__buttons {
  display: flex;
  gap: 1.5rem;
}

.nav-btn {
  background: #0f172a;
  border: none;
  color: rgba(255, 255, 255, 0.822);
  padding: 0.6rem 1.2rem;
  border-radius: 60px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
  font-size: 1rem;
}

.nav-btn.active {
  background: #1e293b;
  color: rgba(255, 255, 255, 0.827);
  box-shadow: 0 0 10px #43557fbc;
}

.nav-btn:hover {
  background: #2d3748;
}

/* Блок аутентификации */
.topnav__auth .btn-outline {
  background: transparent;
  border: 1.5px solid #475569;
  color: rgba(255, 255, 255, 0.819);
  padding: 0.6rem 1.2rem;
  border-radius: 60px;
  cursor: pointer;
}

.user {
  margin-right: 0.5rem;
}

.small {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .topnav {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 1rem;
  }

  .topnav__buttons {
    width: 100%;
    justify-content: center;
  }

  .topnav__auth {
    width: 100%;
    text-align: center;
  }
}

.topnav__center {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topnav__auth .btn-outline {
  background: transparent;
  border: 1.5px solid #475569;
  color: rgba(255, 255, 255, 0.819);
  padding: 0.6rem 1.2rem;
  border-radius: 60px;
  cursor: pointer;
  transition: all 0.2s;
}

.topnav__auth .btn-outline:hover {
  background: #2d3748;
  border-color: #64748b;
  color: white;
  box-shadow: 0 0 10px #43557fbc;
}

@media (max-width: 768px) {
  .topnav {
    flex-direction: column;
    height: auto;
    gap: 1rem;
    padding: 1rem;
  }

  .topnav__center {
    flex-direction: column;
    width: 100%;
    gap: 0.8rem;
  }

  .topnav__buttons {
    width: 100%;
    justify-content: center;
  }

  .topnav__auth {
    width: 100%;
    text-align: center;
  }
}

.theme-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1.5px solid #475569;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background: #2d3748;
  border-color: #64748b;
  box-shadow: 0 0 10px #43557fbc;
}

.topnav__auth {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-icon {
  width: 20px;
  height: 20px;
  display: block;
}
</style>