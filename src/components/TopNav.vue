<script setup>
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

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
</script>

<template>
  <header class="topnav">
    <!-- Левая часть: логотип -->
    <div class="topnav__logo" @click="goToHome">
      <img src="../assets/icons/logo.png" alt="Logo" class="logo-img">
      <div class="logo-text">
        <span class="brand">NAVIWAL</span>
        <span class="sub">OBLIVIONE GROUP</span>
      </div>
    </div>

    <!-- Правая часть: навигационные кнопки -->
    <div class="topnav__buttons">
      <button
        @click="goToHome"
        class="nav-btn"
        :class="{ active: $route.name === 'Home' }"
      >
        Сотрудники
      </button>
      <button
        v-if="isAdmin"
        @click="goToAdmin"
        class="nav-btn"
        :class="{ active: $route.name === 'Admin' }"
      >
        HR-панель
      </button>
    </div>

    <!-- Блок аутентификации -->
    <div class="topnav__auth">
      <div v-if="!isAuthenticated">
        <button @click="goToLogin" class="btn-outline">Вход</button>
      </div>
      <div v-else>
        <span class="user">HR</span>
        <button @click="handleLogout" class="btn-outline small">Выйти</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.logo-img {
  height: 50px;
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
  gap: 0.1rem;
  cursor: pointer;
}

.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
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
</style>