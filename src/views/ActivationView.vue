<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as profilesApi from '@/api/profiles'
import FormField from '@/components/FormField.vue'
import { useNow } from '@/composables/useNow'
import { useAuthStore } from '@/stores/auth'
import { formatDuration, formatNation, formatTankType, formatTier } from '@/utils/format'

const auth = useAuthStore()
const now = useNow(1000)

/** @type {import('vue').Ref<import('@/api/profiles').ActivationChallenge|null>} */
const challenge = ref(null)
const loading = ref(true)
const loadError = ref('')

const nickname = ref('')
const consoleType = ref('x')
const errors = reactive({ nickname: '', console: '' })
const formError = ref('')
const starting = ref(false)
// Nick podany w tej sesji (backend nie zwraca go w opisie wyzwania).
const startedFor = ref('')

const verifying = ref(false)
const verifyError = ref('')
const justActivated = ref(false)

onMounted(async () => {
  if (auth.isActive) {
    loading.value = false
    return
  }
  try {
    challenge.value = await profilesApi.getActivation()
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

const remaining = computed(() =>
  challenge.value ? new Date(challenge.value.expires_at).getTime() - now.value : 0,
)
const expired = computed(() => !!challenge.value && remaining.value <= 0)

async function start() {
  errors.nickname = ''
  errors.console = ''
  formError.value = ''
  starting.value = true

  const nick = nickname.value.trim()
  try {
    challenge.value = await profilesApi.startActivation({
      nickname: nick,
      console: consoleType.value,
    })
    startedFor.value = `${nick}-${consoleType.value}`
    verifyError.value = ''
  } catch (e) {
    const fields = e.fieldErrors ?? {}
    errors.nickname = fields.nickname ?? ''
    errors.console = fields.console ?? ''
    if (!errors.nickname && !errors.console) formError.value = e.message
  } finally {
    starting.value = false
  }
}

async function verify() {
  verifyError.value = ''
  verifying.value = true
  try {
    auth.profile = await profilesApi.verifyActivation()
    justActivated.value = true
  } catch (e) {
    verifyError.value = e.message
  } finally {
    verifying.value = false
  }
}

function restart() {
  challenge.value = null
  verifyError.value = ''
}
</script>

<template>
  <section class="card wide">
    <h1>Aktywacja konta</h1>

    <p v-if="loading" class="muted">Ładowanie…</p>

    <!-- Profil aktywny -->
    <div v-else-if="auth.isActive" class="stack">
      <p v-if="justActivated" class="success" role="status">
        Gotowe! Profil <strong>{{ auth.profile?.full_nickname }}</strong> został aktywowany.
      </p>
      <p v-else>
        Twój profil <strong>{{ auth.profile?.full_nickname }}</strong> jest już aktywny.
      </p>
      <RouterLink class="btn link-btn" :to="{ name: 'home' }">Przejdź do eventu</RouterLink>
    </div>

    <!-- Aktywacja w toku -->
    <div v-else-if="challenge && !expired" class="stack">
      <p>
        Żeby potwierdzić, że to Twoje konto{{ startedFor ? ` (${startedFor})` : '' }}, zagraj bitwę
        wylosowanym czołgiem.
      </p>

      <div class="tank-card">
        <img v-if="challenge.tank?.img" :src="challenge.tank.img" alt="" class="tank-photo" />
        <div>
          <strong class="tank-title">{{ challenge.tank?.name ?? 'Nieznany czołg' }}</strong>
          <div v-if="challenge.tank" class="muted">
            Tier {{ formatTier(challenge.tank.tier) }} · {{ formatNation(challenge.tank.nation) }} ·
            {{ formatTankType(challenge.tank.tank_type) }}
          </div>
        </div>
      </div>

      <div class="countdown" role="timer">
        <span class="muted">Pozostały czas</span>
        <strong>{{ formatDuration(remaining) }}</strong>
      </div>

      <ol class="steps">
        <li>Uruchom grę i rozegraj co najmniej jedną bitwę tym czołgiem.</li>
        <li>Wróć tutaj i kliknij „Zweryfikuj”.</li>
      </ol>
      <p class="muted">
        Liczy się tylko bitwa rozegrana po rozpoczęciu aktywacji. Statystyki mogą pojawić się z
        opóźnieniem. Jeśli weryfikacja nic nie znajdzie, odczekaj chwilę i spróbuj ponownie.
      </p>

      <p v-if="verifyError" class="alert" role="alert">{{ verifyError }}</p>

      <button class="btn" type="button" :disabled="verifying" @click="verify">
        {{ verifying ? 'Weryfikacja…' : 'Zweryfikuj' }}
      </button>
    </div>

    <!-- Czas minął -->
    <div v-else-if="challenge && expired" class="stack">
      <p class="alert" role="alert">Czas na aktywację minął. Rozpocznij ją od nowa.</p>
      <button class="btn" type="button" @click="restart">Zacznij od nowa</button>
    </div>

    <!-- Formularz startu -->
    <form v-else class="stack" @submit.prevent="start">
      <p class="muted">
        Podaj nick z gry i konsolę. Następnie wylosujemy czołg, którym musisz zagrać bitwę w ciągu
        godziny.
      </p>

      <p v-if="loadError" class="alert" role="alert">{{ loadError }}</p>
      <p v-if="formError" class="alert" role="alert">{{ formError }}</p>

      <FormField
        id="nickname"
        v-model="nickname"
        label="Nick w grze (bez końcówki -x / -p)"
        maxlength="64"
        autocomplete="off"
        :error="errors.nickname"
        required
      />

      <fieldset class="console-field">
        <legend>Konsola</legend>
        <label><input v-model="consoleType" type="radio" value="x" /> Xbox</label>
        <label><input v-model="consoleType" type="radio" value="p" /> PlayStation</label>
        <p v-if="errors.console" class="field-error">{{ errors.console }}</p>
      </fieldset>

      <button class="btn" type="submit" :disabled="starting">
        {{ starting ? 'Szukam gracza…' : 'Rozpocznij aktywację' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.wide {
  max-width: 32rem;
}

.link-btn {
  text-align: center;
  text-decoration: none;
}

.success {
  margin: 0;
  padding: 0.6rem 0.75rem;
  color: var(--text);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border-radius: var(--radius);
}

.console-field {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.console-field legend {
  margin-bottom: 0.25rem;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.console-field label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.tank-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.tank-photo {
  flex: none;
  width: 6rem;
  height: 3.5rem;
  object-fit: contain;
}

.tank-title {
  font-size: 1.125rem;
}

.countdown {
  display: flex;
  flex-direction: column;
}

.countdown strong {
  font-size: 1.75rem;
  font-variant-numeric: tabular-nums;
}

.steps {
  margin: 0;
  padding-left: 1.25rem;
}
</style>
