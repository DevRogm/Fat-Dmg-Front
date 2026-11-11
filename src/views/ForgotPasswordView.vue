<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as authApi from '@/api/auth'
import FormField from '@/components/FormField.vue'

const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authApi.requestPasswordReset(email.value.trim())
    sent.value = true
  } catch (e) {
    error.value = e.fieldErrors?.email ?? e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="card">
    <h1>Reset hasła</h1>

    <template v-if="sent">
      <p>
        Jeśli konto z adresem <strong>{{ email }}</strong> istnieje, wysłaliśmy na nie link do
        ustawienia nowego hasła. Link jest ważny 2 godziny.
      </p>
      <p class="muted"><RouterLink :to="{ name: 'login' }">Wróć do logowania</RouterLink></p>
    </template>

    <form v-else class="stack" @submit.prevent="submit">
      <p class="muted">Podaj adres e-mail przypisany do konta, a wyślemy Ci link do resetu.</p>
      <p v-if="error" class="alert" role="alert">{{ error }}</p>

      <FormField
        id="email"
        v-model="email"
        label="E-mail"
        type="email"
        autocomplete="email"
        required
        autofocus
      />

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Wysyłanie…' : 'Wyślij link' }}
      </button>

      <p class="muted"><RouterLink :to="{ name: 'login' }">Wróć do logowania</RouterLink></p>
    </form>
  </section>
</template>
