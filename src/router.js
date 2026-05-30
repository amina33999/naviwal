import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from './composables/useAuth'

import HomePage from './views/HomePage.vue'
import EmployeeDetail from './views/EmployeeDetail.vue'
import AdminPanel from './views/AdminPanel.vue'
import LoginPage from './views/LoginPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/employee/:id', name: 'EmployeeDetail', component: EmployeeDetail },
  { path: '/admin', name: 'Admin', component: AdminPanel, meta: { requiresAdmin: true } },
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const { isAdmin, isAuthenticated } = useAuth()
  
  if (to.meta.requiresAdmin && !isAdmin.value) {
    next({ name: 'Home' })
  } else if (to.meta.guestOnly && isAuthenticated.value) {
    next({ name: 'Home' })
  } else {
    next()
  }
})