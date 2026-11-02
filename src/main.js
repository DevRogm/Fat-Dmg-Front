import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/main.css'

import App from './App.vue'
import router from './router'
import { setAuthLostHandler } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Po tylu ms montujemy aplikację nawet wtedy, gdy backend nie odpowiada.
const MOUNT_TIMEOUT_MS = 3000

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

// Montujemy dopiero po pierwszej nawigacji (profil + widok załadowane),
// dzięki czemu nie widać przeskoków z "pustego" stanu do gotowej strony.
const timeout = new Promise((resolve) => setTimeout(resolve, MOUNT_TIMEOUT_MS))
Promise.race([router.isReady().catch(() => {}), timeout]).then(() => app.mount('#app'))
