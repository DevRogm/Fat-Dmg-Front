<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as accountApi from '@/api/account'
import FormField from '@/components/FormField.vue'
import PlayerName from '@/components/PlayerName.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

/** @type {import('vue').Ref<import('@/api/account').Account|null>} */
const account = ref(null)
const loadError = ref('')
const loading = ref(true)

// --- dane konta ---
const form = reactive({ username: '', email: '' })
const formErrors = reactive({ username: '', email: '' })
const formError = ref('')
const formSaved = ref(false)
const formSaving = ref(false)

// --- hasło ---
const pw = reactive({ old: '', new: '', repeat: '' })
const pwErrors = reactive({ old: '', new: '', repeat: '' })
const pwError = ref('')
const pwSaved = ref(false)
const pwSaving = ref(false)

function applyAccount(data) {
  account.value = data
  form.username = data.username
  form.email = data.email ?? ''
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    applyAccount(await accountApi.getAccount())
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
}

async function saveAccount() {
  formErrors.username = ''
  formErrors.email = ''
  formError.value = ''
  formSaved.value = false
  formSaving.value = true
  try {
    applyAccount(
      await accountApi.updateAccount({
        username: form.username.trim(),
        email: form.email.trim(),
      }),
    )
    formSaved.value = true
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    formErrors.username = fields.username ?? ''
    formErrors.email = fields.email ?? ''
    if (!formErrors.username && !formErrors.email) formError.value = e.message
  } finally {
    formSaving.value = false
  }
}

async function savePassword() {
  pwErrors.old = ''
  pwErrors.new = ''
  pwErrors.repeat = ''
  pwError.value = ''
  pwSaved.value = false

  if (pw.new !== pw.repeat) {
    pwErrors.repeat = 'Hasła nie są takie same.'
    return
  }

  pwSaving.value = true
  try {
    await accountApi.changePassword({ old_password: pw.old, new_password: pw.new })
    pw.old = ''
    pw.new = ''
    pw.repeat = ''
    pwSaved.value = true
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    pwErrors.old = fields.old_password ?? ''
    pwErrors.new = fields.new_password ?? ''
    if (!pwErrors.old && !pwErrors.new) pwError.value = e.message
  } finally {
    pwSaving.value = false
  }
}

onMounted(async () => {
  await load()
  // odśwież profil w nagłówku (np. po aktywacji w innej karcie)
  auth.fetchProfile().catch(() => {})
})
</script>

<template>
  <section class="account container">
    <h1>Konto</h1>

    <p v-if="loadError" class="alert" role="alert">
      {{ loadError }}
      <button class="btn btn-secondary btn-small" type="button" @click="load">Spróbuj ponownie</button>
    </p>
    <p v-else-if="loading" class="muted">Ładowanie…</p>

    <template v-else-if="account">
      <div class="panel">
        <h2>Profil gracza</h2>
        <p class="status-row">
          <span>Status:</span>
          <span v-if="account.is_active_profile" class="status ok">aktywne</span>
          <span v-else class="status off">nieaktywne</span>
        </p>
        <p v-if="account.is_active_profile">
          Powiązany nick:
          <strong><PlayerName :nickname="account.nickname" :console-type="account.console" /></strong>
        </p>
        <template v-else>
          <p class="muted">
            Aktywuj konto, żeby dołączać do eventów. Wystarczy rozegrać jedną bitwę
            wylosowanym czołgiem.
          </p>
          <RouterLink class="btn link-btn" :to="{ name: 'activate' }">Aktywuj konto</RouterLink>
        </template>
      </div>

      <form class="panel stack" @submit.prevent="saveAccount">
        <h2>Dane konta</h2>
        <p v-if="formError" class="alert" role="alert">{{ formError }}</p>
        <p v-if="formSaved" class="success" role="status">Zapisano zmiany.</p>

        <FormField
          id="account-username"
          v-model="form.username"
          label="Nazwa konta (login)"
          autocomplete="username"
          :error="formErrors.username"
          required
        />
        <FormField
          id="account-email"
          v-model="form.email"
          label="E-mail"
          type="email"
          autocomplete="email"
          :error="formErrors.email"
          required
        />
        <p v-if="!account.email" class="muted">
          Dodaj adres e-mail, żeby móc zresetować hasło, gdy je zapomnisz.
        </p>

        <button class="btn" type="submit" :disabled="formSaving">
          {{ formSaving ? 'Zapisywanie…' : 'Zapisz zmiany' }}
        </button>
      </form>

      <form class="panel stack" @submit.prevent="savePassword">
        <h2>Zmiana hasła</h2>
        <p v-if="pwError" class="alert" role="alert">{{ pwError }}</p>
        <p v-if="pwSaved" class="success" role="status">Hasło zostało zmienione.</p>

        <FormField
          id="pw-old"
          v-model="pw.old"
          label="Obecne hasło"
          type="password"
          autocomplete="current-password"
          :error="pwErrors.old"
          required
        />
        <FormField
          id="pw-new"
          v-model="pw.new"
          label="Nowe hasło"
          type="password"
          autocomplete="new-password"
          :error="pwErrors.new"
          required
        />
        <FormField
          id="pw-repeat"
          v-model="pw.repeat"
          label="Powtórz nowe hasło"
          type="password"
          autocomplete="new-password"
          :error="pwErrors.repeat"
          required
        />

        <button class="btn" type="submit" :disabled="pwSaving">
          {{ pwSaving ? 'Zapisywanie…' : 'Zmień hasło' }}
        </button>
      </form>
    </template>
  </section>
</template>

<style scoped>
.account {
  max-width: 36rem;
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.account h1 {
  margin: 0;
}

.status-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0 0 0.5rem;
}

.status {
  padding: 0.1rem 0.6rem;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid currentColor;
  border-radius: 999px;
}

.status.ok {
  color: #15803d;
}

.status.off {
  color: var(--accent);
}

.success {
  margin: 0;
  padding: 0.6rem 0.75rem;
  font-size: 0.875rem;
  color: #15803d;
  border: 1px solid currentColor;
  border-radius: var(--radius);
}

.link-btn {
  display: inline-block;
  text-decoration: none;
}
</style>
