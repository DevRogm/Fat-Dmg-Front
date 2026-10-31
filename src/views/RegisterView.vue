<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import FormField from '@/components/FormField.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const passwordRepeat = ref('')
const errors = reactive({ username: '', password: '', passwordRepeat: '' })
const error = ref('')
const loading = ref(false)

function resetErrors() {
  errors.username = ''
  errors.password = ''
  errors.passwordRepeat = ''
  error.value = ''
}

async function submit() {
  resetErrors()

  if (password.value !== passwordRepeat.value) {
    errors.passwordRepeat = 'Hasła nie są takie same.'
    return
  }

  loading.value = true
  try {
    await auth.register(username.value.trim(), password.value)
    // Nowe konto nigdy nie jest aktywne – prowadzimy od razu do aktywacji.
    await router.push({ name: 'activate' })
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    errors.username = fields.username ?? ''
    errors.password = fields.password ?? ''
    // Komunikat ogólny tylko wtedy, gdy nie ma błędów przypisanych do pól.
    if (!errors.username && !errors.password) error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="card">
    <h1>Rejestracja</h1>

    <form class="stack" @submit.prevent="submit">
      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <FormField
        id="username"
        v-model="username"
        label="Login"
        autocomplete="username"
        :error="errors.username"
        required
        autofocus
      />
      <FormField
        id="password"
        v-model="password"
        label="Hasło"
        type="password"
        autocomplete="new-password"
        :error="errors.password"
        required
      />
      <FormField
        id="password-repeat"
        v-model="passwordRepeat"
        label="Powtórz hasło"
        type="password"
        autocomplete="new-password"
        :error="errors.passwordRepeat"
        required
      />

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Tworzenie konta…' : 'Zarejestruj się' }}
      </button>

      <p class="muted">
        Masz już konto?
        <RouterLink :to="{ name: 'login', query: route.query }">Zaloguj się</RouterLink>
      </p>
    </form>
  </section>
</template>
