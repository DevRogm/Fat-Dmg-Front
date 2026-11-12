<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import * as profilesApi from '@/api/profiles'
import BestResultTile from '@/components/BestResultTile.vue'
import PlayerName from '@/components/PlayerName.vue'
import { useAuthStore } from '@/stores/auth'
import { formatConsole } from '@/utils/format'

const auth = useAuthStore()

/** @type {import('vue').Ref<import('@/api/profiles').ProfileScore[]>} */
const scores = ref([])
const loadingProfile = ref(!auth.profile)
const profileError = ref('')

const profile = computed(() => auth.profile)
/** Najlepszy wynik gracza (endpoint zwraca wyniki posortowane malejąco). */
const best = computed(() => scores.value[0] ?? null)

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

/** Wyniki służą tylko do wyznaczenia najlepszego wyniku; błąd nie psuje strony. */
async function loadScores() {
  if (!profile.value?.id || !profile.value.is_active) {
    scores.value = []
    return
  }
  try {
    scores.value = await profilesApi.getTopScores(profile.value.id)
  } catch {
    scores.value = []
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
            <dd><PlayerName :nickname="profile.nickname" :console-type="profile.console" /></dd>
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
          <BestResultTile
            v-if="best"
            compact
            fill
            class="best-tile"
            :damage="best.damage"
            :tank="best.tank"
            :event-name="best.event"
          />
        </dl>

        <p v-if="!profile.is_active" class="inactive">
          Profil nie jest aktywny, więc nie możesz dołączać do eventów.
          <RouterLink :to="{ name: 'activate' }">Aktywuj konto</RouterLink>
        </p>
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
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  align-items: center;
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

/* Kafelek z najlepszym wynikiem dopełnia linię do prawej; na wąskim ekranie zawija się niżej. */
.best-tile {
  flex: 1 1 18rem;
  max-width: 28rem;
  margin-left: auto;
}
</style>
