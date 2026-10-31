<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import * as profilesApi from '@/api/profiles'
import TankBadge from '@/components/TankBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { formatConsole, formatDateTime, formatNumber } from '@/utils/format'

const auth = useAuthStore()

/** @type {import('vue').Ref<import('@/api/profiles').ProfileScore[]>} */
const scores = ref([])
const loadingProfile = ref(!auth.profile)
const loadingScores = ref(false)
const profileError = ref('')
const scoresError = ref('')

const profile = computed(() => auth.profile)
const bestDamage = computed(() => scores.value[0]?.damage ?? null)

async function loadProfile() {
  loadingProfile.value = true
  profileError.value = ''
  try {
    await auth.fetchProfile()
  } catch (e) {
    profileError.value = e.message
  } finally {
    loadingProfile.value = false
  }
}

async function loadScores() {
  scoresError.value = ''
  if (!profile.value?.id || !profile.value.is_active) {
    scores.value = []
    return
  }
  loadingScores.value = true
  try {
    scores.value = await profilesApi.getTopScores(profile.value.id)
  } catch (e) {
    scoresError.value = e.message
  } finally {
    loadingScores.value = false
  }
}

onMounted(() => {
  // Profil jest zwykle już w store; dociągamy go tylko, gdy start się nie udał.
  if (!auth.profile) loadProfile()
})

watch(() => [profile.value?.id, profile.value?.is_active], loadScores, { immediate: true })
</script>

<template>
  <div class="profile">
    <h1>Profil</h1>

    <p v-if="loadingProfile" class="muted">Ładowanie…</p>

    <p v-else-if="profileError" class="alert" role="alert">
      Nie udało się pobrać profilu: {{ profileError }}
      <button class="btn btn-secondary btn-small" type="button" @click="loadProfile">
        Spróbuj ponownie
      </button>
    </p>

    <template v-else-if="profile">
      <section class="panel summary">
        <dl class="details">
          <div>
            <dt>Nick</dt>
            <dd>{{ profile.full_nickname ?? '—' }}</dd>
          </div>
          <div>
            <dt>Konsola</dt>
            <dd>{{ formatConsole(profile.console) }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <span class="status" :class="profile.is_active ? 'status-ok' : 'status-off'">
                {{ profile.is_active ? 'Aktywny' : 'Nieaktywny' }}
              </span>
            </dd>
          </div>
          <div v-if="profile.is_active">
            <dt>Najlepszy wynik</dt>
            <dd>{{ formatNumber(bestDamage) }}</dd>
          </div>
        </dl>

        <p v-if="!profile.is_active" class="inactive">
          Profil nie jest aktywny, więc nie możesz dołączać do eventów.
          <RouterLink :to="{ name: 'activate' }">Aktywuj konto</RouterLink>
        </p>
      </section>

      <section v-if="profile.is_active" class="panel">
        <h2>Najlepsze wyniki</h2>

        <p v-if="loadingScores" class="muted">Ładowanie wyników…</p>

        <p v-else-if="scoresError" class="alert" role="alert">
          {{ scoresError }}
          <button class="btn btn-secondary btn-small" type="button" @click="loadScores">
            Spróbuj ponownie
          </button>
        </p>

        <p v-else-if="scores.length === 0" class="muted">
          Nie masz jeszcze żadnych wyników. Dołącz do eventu na stronie głównej.
        </p>

        <div v-else class="table-wrap">
          <table class="table">
            <caption class="sr-only">
              Twoje najlepsze wyniki
            </caption>
            <thead>
              <tr>
                <th scope="col" class="num">#</th>
                <th scope="col" class="num">Damage</th>
                <th scope="col">Czołg</th>
                <th scope="col">Event</th>
                <th scope="col">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(score, index) in scores"
                :key="`${score.event_id}-${score.tank.tank_id}-${index}`"
              >
                <td class="num muted">{{ index + 1 }}</td>
                <td class="num damage">{{ formatNumber(score.damage) }}</td>
                <td><TankBadge :tank="score.tank" /></td>
                <td>{{ score.event }}</td>
                <td class="date">{{ formatDateTime(score.damage_date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.profile {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 56rem;
  margin-inline: auto;
}

.profile h1 {
  margin: 0;
}

.alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem;
  margin: 0;
}

.details dt {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.details dd {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.status {
  padding: 0.1rem 0.6rem;
  font-size: 0.875rem;
  border: 1px solid currentColor;
  border-radius: 999px;
}

.status-ok {
  color: #1a7f37;
}

.status-off {
  color: var(--accent);
}

@media (prefers-color-scheme: dark) {
  .status-ok {
    color: #56d364;
  }
}

.inactive {
  margin: 1rem 0 0;
}

.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.table th,
.table td {
  padding: 0.4rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.table th {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.damage {
  font-weight: 700;
}

.date {
  white-space: nowrap;
}
</style>
