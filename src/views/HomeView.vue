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

const myNickname = computed(() => auth.profile?.full_nickname ?? null)

const myIndex = computed(() =>
  myNickname.value ? leaderboard.value.findIndex((r) => r.nickname === myNickname.value) : -1,
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
      <div class="area-info">
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
      </div>

      <!-- Tabela, wynik i bitwy mają sens tylko wtedy, gdy trwa event -->
      <template v-if="event">
        <div class="area-board">
          <LeaderboardTable :rows="leaderboard" :highlight-nickname="myNickname" :limit="20" />
        </div>

        <div class="area-mine side">
          <MyScoreCard
            :status="status"
            :row="myRow"
            :position="myPosition"
            :participants="leaderboard.length"
            :battles="battles.mine"
          />

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
  align-items: start;
  grid-template-areas:
    'info'
    'mine'
    'board';
}

.area-info {
  grid-area: info;
}
.area-board {
  grid-area: board;
}
.area-mine {
  grid-area: mine;
}

@media (min-width: 64rem) {
  .home-grid {
    grid-template-columns: minmax(16rem, 1fr) minmax(0, 1.8fr) minmax(16rem, 1fr);
    grid-template-areas: 'info board mine';
  }
}

.home-grid.single {
  grid-template-columns: minmax(0, 36rem);
  grid-template-areas: 'info';
  justify-content: center;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
