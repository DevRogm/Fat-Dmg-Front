<script setup>
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as authApi from '@/api/auth'
import FormField from '@/components/FormField.vue'

const props = defineProps({
  uid: { type: String, required: true },
  token: { type: String, required: true },
})

const password = ref('')
const passwordRepeat = ref('')
const errors = reactive({ password: '', passwordRepeat: '' })
const error = ref('')
const loading = ref(false)
const done = ref(false)

async function submit() {
  errors.password = ''
  errors.passwordRepeat = ''
  error.value = ''

  if (password.value !== passwordRepeat.value) {
    errors.passwordRepeat = 'Hasła nie są takie same.'
    return
  }

  loading.value = true
  try {
    await authApi.confirmPasswordReset({
      uid: props.uid,
      token: props.token,
      new_password: password.value,
    })
    done.value = true
  } catch (e) {
    errors.password = e.fieldErrors?.new_password ?? ''
    if (!errors.password) error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="card">
    <h1>Nowe hasło</h1>

    <template v-if="done">
      <p>Hasło zostało zmienione. Możesz się teraz zalogować.</p>
      <RouterLink class="btn link-btn" :to="{ name: 'login' }">Przejdź do logowania</RouterLink>
    </template>

    <form v-else class="stack" @submit.prevent="submit">
      <p v-if="error" class="alert" role="alert">
        {{ error }}
        <RouterLink :to="{ name: 'forgot-password' }">Poproś o nowy link</RouterLink>
      </p>

      <FormField
        id="password"
        v-model="password"
        label="Nowe hasło"
        type="password"
        autocomplete="new-password"
        :error="errors.password"
        required
        autofocus
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
        {{ loading ? 'Zapisywanie…' : 'Ustaw hasło' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.link-btn {
  display: inline-block;
  text-decoration: none;
}
</style>
