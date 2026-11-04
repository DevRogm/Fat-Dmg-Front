import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/events', name: 'events', component: () => import('@/views/EventsView.vue') },
    {
      path: '/events/:id(\\d+)',
      name: 'event-detail',
      component: () => import('@/views/EventDetailView.vue'),
      props: true,
    },
    {
      path: '/stats/:id(\\d+)?',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
      props: true,
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsView.vue'),
    },
    { path: '/youtube', name: 'youtube', component: () => import('@/views/YoutubeView.vue') },
    { path: '/info', name: 'info', component: () => import('@/views/InfoView.vue') },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/activate',
      name: 'activate',
      component: () => import('@/views/ActivationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
