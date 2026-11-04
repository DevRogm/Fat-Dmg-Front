<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import * as eventsApi from '@/api/events'
import CreateEventDialog from '@/components/CreateEventDialog.vue'
import EventCard from '@/components/EventCard.vue'
import { useNow } from '@/composables/useNow'
import { useAuthStore } from '@/stores/auth'
import { TANK_TYPE_OPTIONS, TIER_OPTIONS } from '@/utils/format'

const PAGE_SIZE = 20
const STATUS_OPTIONS = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'running', label: 'Trwające' },
  { value: 'finished', label: 'Zakończone' },
]

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const now = useNow(30_000)

const events = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const dialog = ref(null)
const openEvent = ref(null)

// Filtry żyją w adresie (?status=finished&tier=8&type=heavyTank&page=2),
// dzięki czemu widok można odświeżyć i udostępnić.
const filters = computed(() => {
  const q = route.query
  const tier = Number(q.tier)
  return {
    status: q.status === 'running' || q.status === 'finished' ? q.status : 'all',
    tier: Number.isInteger(tier) && tier >= 1 && tier <= 10 ? tier : '',
    type: TANK_TYPE_OPTIONS.some((o) => o.value === q.type) ? q.type : '',
    page: Math.max(1, Number.parseInt(q.page, 10) || 1),
  }
})

const hasFilters = computed(
  () => filters.value.status !== 'all' || filters.value.tier !== '' || filters.value.type !== '',
)
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

function setFilters(patch) {
  const next = { ...filters.value, page: 1, ...patch }
  const query = {}
  if (next.status !== 'all') query.status = next.status
  if (next.tier !== '') query.tier = String(next.tier)
  if (next.type !== '') query.type = next.type
  if (next.page > 1) query.page = String(next.page)
  router.replace({ name: 'events', query })
}

let requestId = 0

async function load() {
  if (route.name !== 'events') return
  const id = ++requestId
  const f = filters.value
  loading.value = true
  error.value = ''

  try {
    const page = await eventsApi.getEvents({
      is_finished: f.status === 'running' ? false : f.status === 'finished' ? true : undefined,
      tank_tier: f.tier || undefined,
      tank_type: f.type || undefined,
      page: f.page > 1 ? f.page : undefined,
    })
    if (id !== requestId) return // przyszła nowsza odpowiedź
    events.value = page.results
    total.value = page.count
  } catch (e) {
    if (id !== requestId) return
    if (e.status === 404 && f.page > 1) {
      // Strona poza zakresem (np. po zmianie danych) – wracamy na pierwszą.
      setFilters({ page: 1 })
      return
    }
    error.value = e.message
  } finally {
    if (id === requestId) loading.value = false
  }
}

async function checkOpenEvent() {
  if (!auth.isAdmin) return
  try {
    openEvent.value = await eventsApi.getCurrentEvent()
  } catch {
    openEvent.value = null
  }
}

function onCreated() {
  checkOpenEvent()
  load()
}

watch(filters, load, { immediate: true })
onMounted(checkOpenEvent)
</script>

<template>
  <div class="events">
    <header class="top">
      <h1>Wydarzenia</h1>

      <div v-if="auth.isAdmin" class="admin">
        <button class="btn" type="button" :disabled="!!openEvent" @click="dialog.open()">
          Dodaj wydarzenie
        </button>
        <p v-if="openEvent" class="muted">
          Trwa już „{{ openEvent.title }}”. Nowe wydarzenie dodasz po jego zamknięciu.
        </p>
      </div>
    </header>

    <form class="filters" @submit.prevent>
      <div class="field">
        <label for="f-status">Status</label>
        <select
          id="f-status"
          :value="filters.status"
          @change="setFilters({ status: $event.target.value })"
        >
          <option v-for="o in STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="field">
        <label for="f-tier">Tier</label>
        <select
          id="f-tier"
          :value="filters.tier"
          @change="setFilters({ tier: $event.target.value })"
        >
          <option value="">Wszystkie</option>
          <option v-for="o in TIER_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="field">
        <label for="f-type">Typ czołgu</label>
        <select
          id="f-type"
          :value="filters.type"
          @change="setFilters({ type: $event.target.value })"
        >
          <option value="">Wszystkie</option>
          <option v-for="o in TANK_TYPE_OPTIONS" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
      </div>

      <button
        v-if="hasFilters"
        class="btn btn-secondary btn-small"
        type="button"
        @click="setFilters({ status: 'all', tier: '', type: '' })"
      >
        Wyczyść filtry
      </button>
    </form>

    <p v-if="error" class="alert" role="alert">
      Nie udało się pobrać wydarzeń: {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load">
        Spróbuj ponownie
      </button>
    </p>

    <p v-else-if="loading && events.length === 0" class="muted">Ładowanie…</p>

    <p v-else-if="events.length === 0" class="muted">Brak wydarzeń dla wybranych filtrów.</p>

    <template v-else>
      <div class="grid" :aria-busy="loading" :class="{ busy: loading }">
        <EventCard v-for="event in events" :key="event.id" :event="event" :now="now" />
      </div>

      <nav v-if="pageCount > 1" class="pager" aria-label="Strony wydarzeń">
        <button
          class="btn btn-secondary btn-small"
          type="button"
          :disabled="filters.page <= 1"
          @click="setFilters({ page: filters.page - 1 })"
        >
          ← Nowsze
        </button>
        <span class="muted">Strona {{ filters.page }} z {{ pageCount }}</span>
        <button
          class="btn btn-secondary btn-small"
          type="button"
          :disabled="filters.page >= pageCount"
          @click="setFilters({ page: filters.page + 1 })"
        >
          Starsze →
        </button>
      </nav>
    </template>

    <CreateEventDialog v-if="auth.isAdmin" ref="dialog" @created="onCreated" />
  </div>
</template>

<style scoped>
.events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
}

.top h1 {
  margin: 0;
}

.admin {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.admin p {
  margin: 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem 1rem;
}

.alert {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
  align-items: start;
  transition: opacity 0.15s;
}

.grid.busy {
  opacity: 0.6;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
