import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'

import App from './App.vue'
import router from './router'
import { setAuthLostHandler } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Gdy nie da się odświeżyć sesji: wyloguj i, jeśli trzeba, przekieruj na logowanie.
setAuthLostHandler(() => {
  useAuthStore().logout()
  const route = router.currentRoute.value
  if (route.meta.requiresAuth) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
  }
})

app.mount('#app')
