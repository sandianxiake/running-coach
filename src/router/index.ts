import { createRouter, createWebHistory } from 'vue-router'
import { storage } from '@/utils/storage'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/welcome/WelcomePage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/ProfilePage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/profile/ResetPasswordPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/HomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/records',
    name: 'Records',
    component: () => import('@/views/records/RecordsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/plans',
    name: 'Plans',
    component: () => import('@/views/plans/PlansPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/prediction',
    name: 'Prediction',
    component: () => import('@/views/prediction/PredictionPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/coach',
    name: 'Coach',
    component: () => import('@/views/coach/CoachPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mine',
    name: 'Mine',
    component: () => import('@/views/mine/MinePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const requiresAuth = to.meta.requiresAuth !== false
  const userProfile = storage.user.get()

  if (requiresAuth && !userProfile) {
    next({ name: 'Welcome' })
  } else if (to.name === 'Welcome' && userProfile) {
    next({ name: 'Home' })
  } else if (to.name === 'Welcome' && !userProfile) {
    next()
  } else {
    next()
  }
})

export default router
