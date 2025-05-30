import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import CategoryView from '@/views/CategoryView.vue'
import SubCategoryView from '@/views/SubCategoryView.vue'
import ExpenseRecordView from '@/views/ExpenseRecordView.vue'

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
      component: ExpenseRecordView,
    },
    {
      path: '/category',
      name: 'category',
      component: CategoryView,
    },
    {
      path: '/sub-category',
      name: 'sub-category',
      component: SubCategoryView,
    },
  ],
})

export default router
