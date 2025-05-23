import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import CategoryView from '@/views/CategoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/expense-record',
      name: 'expense-record',
      component: DashboardView,
    },
    {
      path: '/category',
      name: 'category',
      component: CategoryView,
    },
    {
      path: '/sub-category',
      name: 'sub-category',
      component: DashboardView,
    },
  ],
})

export default router
