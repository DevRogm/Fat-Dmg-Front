<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import * as eventsApi from '@/api/events'
import EventInfoCard from '@/components/EventInfoCard.vue'
import EventJoin from '@/components/EventJoin.vue'
import LeaderboardTable from '@/components/LeaderboardTable.vue'
import TankBadge from '@/components/TankBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { formatDateTime, formatNumber } from '@/utils/format'

const POLL_INTERVAL_MS = 60_000

const props = defineProps({
  /** Z adresu /events/:id */
  id: { type: String, required: true },
})

const auth = useAuthStore()
const route = useRoute()

/** @type {import('vue').Ref<import('@/api/events').Event|null>} */
const event = ref(null)
const leaderboard = ref([])
const loading = ref(true)
const error = ref('')
const notFound = ref(false)

let requestId = 0
let pollId = null

async function load({ silent = false } = {}) {
  const current = ++requestId
  try {
    const [eventData, board] = await Promise.all([
      eventsApi.getEvent(props.id),
      eventsApi.getLeaderboard(props.id),
    ])
    if (current !== requestId) return
    event.value = eventData
    leaderboard.value = board
    notFound.value = false
    error.value = ''
  } catch (e) {
    if (current !== requestId) return
    if (e.status === 404) {
      notFound.value = true
      event.value = null
    } else if (!silent) {
      error.value = e.message
    }
  } finally {
    if (current === requestId) loading.value = false
  }
}

watch(
  () => props.id,
  () => {
    loading.value = true
    load()
  },
  { immediate: true },
)

// Trwający event odświeżamy po cichu (wyniki zmieniają się w czasie).
onMounted(() => {
  pollId = setInterval(() => {
    if (!document.hidden && event.value && !event.value.is_finished) load({ silent: true })
  }, POLL_INTERVAL_MS)
})
onUnmounted(() => clearInterval(pollId))

const mine = computed(() => event.value?.my_result ?? null)
const myNickname = computed(() => auth.profile?.full_nickname ?? null)
const loginLink = computed(() => ({ name: 'login', query: { redirect: route.fullPath } }))
</script>

<template>
  <div class="detail">
    <RouterLink class="back" :to="{ name: 'events' }">← Wszystkie wydarzenia</RouterLink>

    <p v-if="loading && !event" class="muted">Ładowanie…</p>

    <section v-else-if="notFound" class="panel">
      <h1>Nie znaleziono wydarzenia</h1>
      <p class="muted">Takie wydarzenie nie istnieje albo zostało usunięte.</p>
    </section>

    <p v-else-if="error && !event" class="alert" role="alert">
      Nie udało się pobrać wydarzenia: {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load()">
        Spróbuj ponownie
      </button>
    </p>

    <div v-else-if="event" class="layout">
      <div class="side">
        <EventInfoCard :event="event" heading="Wydarzenie">
          <template #footer>
            <EventJoin :event="event" :participating="!!mine" @joined="load({ silent: true })" />
          </template>
        </EventInfoCard>

        <section class="panel">
          <h2>Twój wynik</h2>

          <p v-if="!auth.isAuthenticated" class="muted">
            <RouterLink :to="loginLink">Zaloguj się</RouterLink>, aby zobaczyć swój wynik.
          </p>

          <p v-else-if="!mine" class="muted">
            {{
              event.is_finished
                ? 'Nie brałeś udziału w tym evencie.'
                : 'Nie bierzesz jeszcze udziału w tym evencie.'
            }}
          </p>

          <div v-else class="mine">
            <p class="position">
              Miejsce <strong>{{ mine.place ? `#${mine.place}` : '—' }}</strong>
              <span v-if="mine.place" class="muted"> z {{ event.participants_count }}</span>
            </p>
            <p class="best">
              <span class="muted">Najlepszy wynik</span>
              <strong>{{ formatNumber(mine.best_damage) }}</strong>
            </p>
            <TankBadge v-if="mine.best_tank" :tank="mine.best_tank" />
            <p v-if="mine.best_damage_date" class="muted date">
              {{ formatDateTime(mine.best_damage_date) }}
            </p>
          </div>
        </section>
      </div>

      <div class="board">
        <p v-if="error" class="alert" role="alert">{{ error }}</p>
        <LeaderboardTable
          :rows="leaderboard"
          :highlight-nickname="myNickname"
          :page-size="20"
          title="Pełna tabela wyników"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.back {
  align-self: flex-start;
}

.layout {
  display: grid;
  gap: 1rem;
  align-items: start;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mine p {
  margin: 0 0 0.25rem;
}

.position strong {
  font-size: 1.5rem;
}

.best {
  display: flex;
  flex-direction: column;
}

.best strong {
  font-size: 1.25rem;
  font-variant-numeric: tabular-nums;
}

.date {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
}

@media (min-width: 56rem) {
  .layout {
    grid-template-columns: minmax(18rem, 1fr) minmax(0, 2fr);
  }
}
</style>
