<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import * as eventsApi from '@/api/events'
import * as profilesApi from '@/api/profiles'
import EventInfoCard from '@/components/EventInfoCard.vue'
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import MyScoreCard from '@/components/MyScoreCard.vue'
import { useNow } from '@/composables/useNow'
import { useAuthStore } from '@/stores/auth'

const POLL_INTERVAL_MS = 60_000
const MY_SCORES_LIMIT = 10

const auth = useAuthStore()
const now = useNow(10_000)

const event = ref(null)
const leaderboard = ref([])
const myScores = ref([])

const loading = ref(true)
const loadError = ref('')
const myScoresError = ref('')
const joining = ref(false)
const joinError = ref('')

let pollId = null

async function loadEvent({ silent = false } = {}) {
  try {
    event.value = await eventsApi.getCurrentEvent()
    leaderboard.value = event.value ? await eventsApi.getLeaderboard(event.value.id) : []
    loadError.value = ''
  } catch (e) {
    // Przy cichym odświeżaniu zostawiamy poprzednie dane zamiast pokazywać błąd.
    if (!silent) loadError.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadMyScores() {
  const profileId = auth.profile?.id
  if (!profileId) {
    myScores.value = []
    myScoresError.value = ''
    return
  }
  try {
    const scores = await profilesApi.getTopScores(profileId)
    myScores.value = scores.slice(0, MY_SCORES_LIMIT)
    myScoresError.value = ''
  } catch (e) {
    myScoresError.value = e.message
  }
}

async function join() {
  joinError.value = ''
  joining.value = true
  try {
    await eventsApi.joinEvent(event.value.id)
    leaderboard.value = await eventsApi.getLeaderboard(event.value.id)
  } catch (e) {
    joinError.value = e.message
  } finally {
    joining.value = false
  }
}

function reload() {
  loading.value = true
  loadEvent()
  loadMyScores()
}

onMounted(() => {
  loadEvent()
  pollId = setInterval(() => {
    if (document.hidden) return
    loadEvent({ silent: true })
    loadMyScores()
  }, POLL_INTERVAL_MS)
})

onUnmounted(() => clearInterval(pollId))

watch(() => auth.profile?.id, loadMyScores, { immediate: true })

const status = computed(() => {
  if (!auth.isAuthenticated) return 'guest'
  return auth.isActive ? 'active' : 'inactive'
})

const myNickname = computed(() => auth.profile?.full_nickname ?? null)

const myIndex = computed(() =>
  myNickname.value ? leaderboard.value.findIndex((r) => r.nickname === myNickname.value) : -1,
)
const myRow = computed(() => (myIndex.value >= 0 ? leaderboard.value[myIndex.value] : null))
const myPosition = computed(() => (myIndex.value >= 0 ? myIndex.value + 1 : null))

const eventEnded = computed(() => event.value && now.value >= new Date(event.value.end_date))
const canJoin = computed(() => status.value === 'active' && !myRow.value && !eventEnded.value)
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

    <div class="home-grid">
      <div class="area-info">
        <EventInfoCard :event="event">
          <template #footer>
            <button v-if="canJoin" class="btn" type="button" :disabled="joining" @click="join">
              {{ joining ? 'Dołączanie…' : 'Dołącz do eventu' }}
            </button>
            <p v-else-if="myRow" class="muted">Bierzesz udział w evencie ✓</p>
            <p v-else-if="status === 'guest'" class="muted">
              <RouterLink :to="{ name: 'login' }">Zaloguj się</RouterLink>, aby dołączyć.
            </p>
            <p v-else-if="status === 'inactive'" class="muted">
              <RouterLink :to="{ name: 'activate' }">Aktywuj profil</RouterLink>, aby dołączyć.
            </p>
            <p v-if="joinError" class="alert" role="alert">{{ joinError }}</p>
          </template>
        </EventInfoCard>
      </div>

      <div class="area-board">
        <LeaderboardTable :rows="leaderboard" :highlight-nickname="myNickname" :limit="20" />
      </div>

      <div class="area-mine">
        <MyScoreCard
          :status="status"
          :has-event="!!event"
          :row="myRow"
          :position="myPosition"
          :participants="leaderboard.length"
          :scores="myScores"
          :error="myScoresError"
        />
      </div>
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
</style>
