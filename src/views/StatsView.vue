<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import * as profilesApi from '@/api/profiles'
import BattleList from '@/components/BattleList.vue'
import BestResultTile from '@/components/BestResultTile.vue'
import PlayerSearch from '@/components/PlayerSearch.vue'
import TankBadge from '@/components/TankBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { formatConsole, formatNumber, formatTankType, formatTier } from '@/utils/format'

const TOP_BATTLES = 10

const props = defineProps({
  /** Z adresu /stats/:id; brak = bez wybranego gracza. */
  id: { type: String, default: '' },
})

const auth = useAuthStore()
const router = useRouter()

/** @type {import('vue').Ref<{ profile: import('@/api/profiles').Profile, summary: import('@/api/profiles').ProfileStatsSummary, events: import('@/api/profiles').ProfileEventResult[] }|null>} */
const stats = ref(null)
const topBattles = ref([])
const loading = ref(false)
const error = ref('')
const notFound = ref(false)

let requestId = 0

async function load(id) {
  const current = ++requestId
  loading.value = true
  error.value = ''
  notFound.value = false
  try {
    const [data, scores] = await Promise.all([
      profilesApi.getProfileStats(id),
      // Lista najlepszych bitew jest dodatkiem – jej błąd nie psuje strony.
      profilesApi.getTopScores(id).catch(() => []),
    ])
    if (current !== requestId) return
    stats.value = data
    topBattles.value = scores.slice(0, TOP_BATTLES)
  } catch (e) {
    if (current !== requestId) return
    stats.value = null
    topBattles.value = []
    if (e.status === 404) notFound.value = true
    else error.value = e.message
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch(
  () => [props.id, auth.profile?.id],
  ([id, myId]) => {
    if (id) {
      load(id)
      return
    }
    requestId++ // unieważnia ewentualne zapytanie o poprzedniego gracza
    stats.value = null
    loading.value = false
    notFound.value = false
    error.value = ''
    // Zalogowany otwiera od razu własne statystyki.
    if (myId) router.replace({ name: 'stats', params: { id: myId } })
  },
  { immediate: true },
)

const isMe = computed(() => !!stats.value && stats.value.profile.id === auth.profile?.id)
const summary = computed(() => stats.value?.summary ?? null)

const tiles = computed(() => {
  const s = summary.value
  if (!s) return []
  return [
    { label: 'Eventy', value: formatNumber(s.events_played) },
    { label: 'Zwycięstwa', value: formatNumber(s.wins) },
    { label: 'Podia (top 3)', value: formatNumber(s.podiums) },
    { label: 'Najlepsze miejsce', value: s.best_place ? `#${s.best_place}` : '—' },
    { label: 'Zapisane bitwy', value: formatNumber(s.battles_count) },
    { label: 'Średni damage', value: formatNumber(s.average_damage) },
  ]
})

function placeLabel(row) {
  if (!row.is_finished) return 'trwa'
  return row.place ? `#${row.place}` : '—'
}
</script>

<template>
  <div class="stats">
    <h1>Statystyki</h1>

    <PlayerSearch />

    <p v-if="!id && !auth.isAuthenticated" class="muted">
      Wyszukaj gracza po nicku albo <RouterLink :to="{ name: 'login' }">zaloguj się</RouterLink>,
      aby zobaczyć własne statystyki.
    </p>

    <p v-else-if="loading && !stats" class="muted">Ładowanie…</p>

    <section v-else-if="notFound" class="panel">
      <h2>Nie znaleziono gracza</h2>
      <p class="muted">Taki gracz nie istnieje. Spróbuj wyszukać go po nicku.</p>
    </section>

    <p v-else-if="error" class="alert" role="alert">
      Nie udało się pobrać statystyk: {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load(id)">
        Spróbuj ponownie
      </button>
    </p>

    <template v-else-if="stats">
      <header class="player">
        <h2>{{ stats.profile.full_nickname ?? 'Gracz bez nicku' }}</h2>
        <span v-if="stats.profile.console" class="muted">
          {{ formatConsole(stats.profile.console) }}
        </span>
        <span v-if="isMe" class="badge">to Ty</span>
      </header>

      <p v-if="summary.events_played === 0" class="muted">
        {{
          isMe
            ? 'Nie brałeś jeszcze udziału w żadnym evencie.'
            : 'Ten gracz nie brał jeszcze udziału w żadnym evencie.'
        }}
      </p>

      <template v-else>
        <ul class="tiles" aria-label="Podsumowanie">
          <li v-for="tile in tiles" :key="tile.label" class="tile">
            <span class="tile-label">{{ tile.label }}</span>
            <strong class="tile-value">{{ tile.value }}</strong>
          </li>
        </ul>

        <BestResultTile
          v-if="summary.best_result"
          :damage="summary.best_result.best_damage"
          :tank="summary.best_result.best_tank"
          :event-name="summary.best_result.event"
        />

        <section class="panel">
          <h2>Historia eventów</h2>
          <div class="table-wrap">
            <table class="table">
              <caption class="sr-only">
                Udział w eventach
              </caption>
              <thead>
                <tr>
                  <th scope="col">Wydarzenie</th>
                  <th scope="col" class="num">Miejsce</th>
                  <th scope="col" class="num">Graczy</th>
                  <th scope="col" class="num">Wynik</th>
                  <th scope="col">Czołg</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in stats.events" :key="row.event_id">
                  <td>
                    <RouterLink :to="{ name: 'event-detail', params: { id: row.event_id } }">
                      {{ row.event }}
                    </RouterLink>
                    <div class="muted small">
                      Tier {{ formatTier(row.tank_tier) }} · {{ formatTankType(row.tank_type) }}
                    </div>
                  </td>
                  <td class="num">{{ placeLabel(row) }}</td>
                  <td class="num">{{ row.participants_count }}</td>
                  <td class="num strong">{{ formatNumber(row.best_damage) }}</td>
                  <td><TankBadge :tank="row.best_tank" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="topBattles.length" class="panel">
          <h2>Najlepsze bitwy</h2>
          <BattleList :battles="topBattles" />
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stats h1 {
  margin: 0;
}

.stats p {
  margin: 0;
}

.player {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.75rem;
}

.player h2 {
  margin: 0;
  font-size: 1.5rem;
}

.badge {
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tile {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.tile-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tile-value {
  font-size: 1.5rem;
  font-variant-numeric: tabular-nums;
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

.strong {
  font-weight: 700;
}

.small {
  font-size: 0.8125rem;
}
</style>
