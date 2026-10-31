<script setup>
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import FormField from '@/components/FormField.vue'
import { useAuthStore } from '@/stores/auth'
import { getSafeRedirect } from '@/utils/navigation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value.trim(), password.value)

    const redirect = getSafeRedirect(route.query.redirect)
    if (redirect) await router.push(redirect)
    else await router.push({ name: auth.isActive ? 'home' : 'activate' })
  } catch (e) {
    error.value = e.status === 401 ? 'Nieprawidłowy login lub hasło.' : e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="card">
    <h1>Logowanie</h1>

    <form class="stack" @submit.prevent="submit">
      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <FormField
        id="username"
        v-model="username"
        label="Login"
        autocomplete="username"
        required
        autofocus
      />
      <FormField
        id="password"
        v-model="password"
        label="Hasło"
        type="password"
        autocomplete="current-password"
        required
      />

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Logowanie…' : 'Zaloguj się' }}
      </button>

      <p class="muted">
        Nie masz konta?
        <RouterLink :to="{ name: 'register', query: route.query }">Zarejestruj się</RouterLink>
      </p>
    </form>
  </section>
</template>
