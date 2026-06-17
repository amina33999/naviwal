import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import EmployeeDetail from './views/EmployeeDetail.vue'
import AdminPanel from './views/AdminPanel.vue'
import LoginPage from './views/LoginPage.vue'
import NotFound from './views/NotFound.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/employee/:id', name: 'EmployeeDetail', component: EmployeeDetail },
  { path: '/admin', name: 'Admin', component: AdminPanel, meta: { requiresAdmin: true } },
  { path: '/login', name: 'Login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/404', name: 'NotFound', component: NotFound, meta: { is404: true } },
  { path: '/:pathMatch(.*)*', redirect: '/404' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // ИСПРАВЛЕНО: Проверяем наличие токена (как в композибле useEmployees), 
  // чтобы роутер и логика авторизации работали с одним и тем же ключом
  const isAuth = !!localStorage.getItem('token')
  
  if (to.meta.is404) {
    next()
  } else if (to.meta.requiresAdmin && !isAuth) {
    // Если HR-панель требует админа, а мы не авторизованы — отправляем на Login
    next({ name: 'Login' })
  } else if (to.meta.guestOnly && isAuth) {
    // Если авторизованы, но пытаемся зайти на страницу логина — перекидываем в админку
    next({ name: 'Admin' })
  } else {
    next()
  }
})

export default router