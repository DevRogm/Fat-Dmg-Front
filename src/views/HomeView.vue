<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import * as eventsApi from '@/api/events'
import BattleList from '@/components/BattleList.vue'
import EventInfoCard from '@/components/EventInfoCard.vue'
import EventJoin from '@/components/EventJoin.vue'
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import MyScoreCard from '@/components/MyScoreCard.vue'
import { useAuthStore } from '@/stores/auth'

const POLL_INTERVAL_MS = 60_000

const auth = useAuthStore()

const event = ref(null)
const leaderboard = ref([])
/** @type {import('vue').Ref<{ mine: import('@/api/events').Battle[], others: import('@/api/events').Battle[] }>} */
const battles = ref({ mine: [], others: [] })

const loading = ref(true)
const loadError = ref('')

let pollId = null

async function loadEvent({ silent = false } = {}) {
  try {
    const current = await eventsApi.getCurrentEvent()
    if (current) {
      // Lista bitew jest dodatkiem – jej błąd nie może psuć tabeli wyników.
      const [board, recent] = await Promise.all([
        eventsApi.getLeaderboard(current.id),
        eventsApi.getRecentBattles(current.id).catch(() => ({ mine: [], others: [] })),
      ])
      leaderboard.value = board
      battles.value = recent
    } else {
      leaderboard.value = []
      battles.value = { mine: [], others: [] }
    }
    event.value = current
    loadError.value = ''
  } catch (e) {
    // Przy cichym odświeżaniu zostawiamy poprzednie dane zamiast pokazywać błąd.
    if (!silent) loadError.value = e.message
  } finally {
    loading.value = false
  }
}

function onJoined() {
  loadEvent({ silent: true })
}

function reload() {
  loading.value = true
  loadEvent()
}

onMounted(() => {
  loadEvent()
  pollId = setInterval(() => {
    if (!document.hidden) loadEvent({ silent: true })
  }, POLL_INTERVAL_MS)
})

onUnmounted(() => clearInterval(pollId))

const status = computed(() => {
  if (!auth.isAuthenticated) return 'guest'
  return auth.isActive ? 'active' : 'inactive'
})

const myProfileId = computed(() => auth.profile?.id ?? null)

const myIndex = computed(() =>
  myProfileId.value ? leaderboard.value.findIndex((r) => r.profile_id === myProfileId.value) : -1,
)
const myRow = computed(() => (myIndex.value >= 0 ? leaderboard.value[myIndex.value] : null))
// Miejsce pokazujemy tylko wtedy, gdy gracz ma już jakiś wynik w evencie.
const myPosition = computed(() =>
  myIndex.value >= 0 && myRow.value?.best_damage != null ? myIndex.value + 1 : null,
)
</script>

<template>
  <div v-if="loading" class="muted">Ładowanie…</div>

  <template v-else>
    <p v-if="loadError" class="alert" role="alert">
      Nie udało się pobrać danych: {{ loadError }}
      <button class="btn btn-secondary btn-small" type="button" @click="reload">
        Spróbuj ponownie
      </button>
    </p>

    <div class="home-grid" :class="{ single: !event }">
      <div class="area-left side">
        <EventInfoCard :event="event">
          <template #empty>
            <p>
              <RouterLink :to="{ name: 'events' }">Zobacz poprzednie wydarzenia →</RouterLink>
            </p>
          </template>
          <template #footer>
            <EventJoin :event="event" :participating="!!myRow" @joined="onJoined" />
          </template>
        </EventInfoCard>

        <MyScoreCard
          v-if="event"
          :status="status"
          :row="myRow"
          :position="myPosition"
          :participants="leaderboard.length"
        />
      </div>

      <!-- Tabela, wynik i bitwy mają sens tylko wtedy, gdy trwa event -->
      <template v-if="event">
        <div class="area-board">
          <LeaderboardTable :rows="leaderboard" :highlight-profile-id="myProfileId" :page-size="10" />
        </div>

        <div class="area-battles side">
          <section v-if="status === 'active'" class="panel">
            <h2>Twoje ostatnie bitwy</h2>
            <BattleList :battles="battles.mine" />
          </section>

          <section class="panel">
            <h2>Ostatnie bitwy innych graczy</h2>
            <BattleList :battles="battles.others" show-nickname />
          </section>
        </div>
      </template>
    </div>
  </template>
</template>

<style scoped>
.alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.home-grid {
  display: grid;
  gap: 1rem;
  grid-template-areas:
    'left'
    'board'
    'battles';
}

.area-left {
  grid-area: left;
}
.area-board {
  grid-area: board;
  display: flex;
}

/* Tabela wypełnia całą wysokość kolumny, więc ramki są równo z lewą i prawą stroną. */
.area-board > .panel {
  flex: 1;
  min-width: 0;
}
.area-battles {
  grid-area: battles;
}

@media (min-width: 64rem) {
  .home-grid {
    grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 1.5fr) minmax(18rem, 1.2fr);
    grid-template-areas: 'left board battles';
  }
}

.home-grid.single {
  grid-template-columns: minmax(0, 36rem);
  grid-template-areas: 'left';
  justify-content: center;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Ostatni panel w bocznej kolumnie dociąga się do dołu. */
.side > .panel:last-child {
  flex: 1;
}
</style>
