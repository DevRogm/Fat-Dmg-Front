<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import * as profilesApi from '@/api/profiles'

const MIN_LENGTH = 2
const DEBOUNCE_MS = 300

const router = useRouter()

const query = ref('')
const results = ref([])
const total = ref(0)
const loading = ref(false)
const searched = ref(false)
const error = ref('')

let timer = null
let requestId = 0

// Nick w grze ma końcówkę -x / -p – w bazie szukamy po samym nicku.
const normalize = (value) => value.trim().replace(/-[xp]$/i, '')

function reset() {
  results.value = []
  total.value = 0
  searched.value = false
  loading.value = false
  error.value = ''
}

async function run(text) {
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const page = await profilesApi.searchProfiles(text)
    if (id !== requestId) return // przyszła nowsza odpowiedź
    results.value = page.results
    total.value = page.count
    searched.value = true
  } catch (e) {
    if (id !== requestId) return
    error.value = e.message
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(query, (value) => {
  clearTimeout(timer)
  const text = normalize(value)
  if (text.length < MIN_LENGTH) {
    requestId++ // unieważnia trwające zapytanie
    reset()
    return
  }
  timer = setTimeout(() => run(text), DEBOUNCE_MS)
})

function clear() {
  query.value = ''
}

// Enter otwiera pierwszy wynik.
function submit() {
  const first = results.value[0]
  if (!first) return
  router.push({ name: 'stats', params: { id: first.id } })
  clear()
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <form class="search" role="search" @submit.prevent="submit">
    <div class="field">
      <label for="player-search">Szukaj gracza</label>
      <input
        id="player-search"
        v-model="query"
        type="search"
        autocomplete="off"
        placeholder="Wpisz nick (min. 2 znaki)"
      />
    </div>

    <p v-if="error" class="alert" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="muted" role="status">Szukam…</p>

    <template v-else-if="searched">
      <p v-if="results.length === 0" class="muted" role="status">Nie znaleziono takiego gracza.</p>

      <template v-else>
        <ul class="results">
          <li v-for="profile in results" :key="profile.id">
            <RouterLink :to="{ name: 'stats', params: { id: profile.id } }" @click="clear">
              {{ profile.full_nickname }}
            </RouterLink>
          </li>
        </ul>
        <p v-if="total > results.length" class="muted">
          Pokazano {{ results.length }} z {{ total }}. Wpisz więcej liter, aby zawęzić.
        </p>
      </template>
    </template>
  </form>
</template>

<style scoped>
.search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 28rem;
}

.search p {
  margin: 0;
}

.results {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.results li + li {
  border-top: 1px solid var(--border);
}

.results a {
  display: block;
  padding: 0.5rem 0.75rem;
  color: inherit;
  text-decoration: none;
}

.results a:hover,
.results a:focus-visible {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}
</style>
