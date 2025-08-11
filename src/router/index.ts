import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import CategoryView from '@/views/CategoryView.vue'
import SubCategoryView from '@/views/SubCategoryView.vue'
import ExpenseRecordView from '@/views/ExpenseRecordView.vue'
import RegisterView from '@/views/authentication/RegisterView.vue'
import VerifyOptView from '@/views/authentication/VerifyOptView.vue'
import LoginView from '@/views/authentication/LoginView.vue'
import { toast } from 'vue3-toastify'
import { isAuthenticated } from '@/lib/auth'
import NotFound from '@/components/NotFound.vue'
import ForgotPasswordView from '@/views/authentication/ForgotPasswordView.vue'
import ResetPassword from '@/views/authentication/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/:pathMatch(.*)', component: NotFound },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { hideSidebar: true, ensureLogout: true },
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: VerifyOptView,
      meta: { hideSidebar: true, ensureLogout: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideSidebar: true, ensureLogout: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { hideSidebar: true, ensureLogout: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: { hideSidebar: true, ensureLogout: true },
    },
    {
      path: '/expense-record',
      name: 'expense-record',
      component: ExpenseRecordView,
      meta: { requiresAuth: true },
    },
    {
      path: '/category',
      name: 'category',
      component: CategoryView,
      meta: { requiresAuth: true },
    },
    {
      path: '/sub-category',
      name: 'sub-category',
      component: SubCategoryView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const isAuthenticate = await isAuthenticated()

  if (to.meta.ensureLogout && isAuthenticate) {
    next('/')
    setTimeout(() => {
      toast.error('You are already logged in')
    }, 50)
  }

  if (to.meta.requiresAuth && !isAuthenticate) {
    next('/login')
    setTimeout(() => {
      toast.error('Please login to access this page')
    }, 50)
  } else {
    next()
  }
})

export default router
