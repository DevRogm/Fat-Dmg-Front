<script setup>
import { computed, onMounted, ref } from 'vue'

import * as achievementsApi from '@/api/achievements'

/** @type {import('vue').Ref<import('@/api/achievements').Achievement[]>} */
const achievements = ref([])
const loading = ref(true)
const error = ref('')

/** Emblematy pogrupowane po nazwie grupy (backend zwraca je posortowane po grupie i nazwie). */
const groups = computed(() => {
  const map = new Map()
  for (const item of achievements.value) {
    if (!map.has(item.group)) map.set(item.group, [])
    map.get(item.group).push(item)
  }
  return [...map].map(([name, items]) => ({ name, items }))
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    achievements.value = await achievementsApi.getAchievements()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="achievements container">
    <h1>Osiągnięcia</h1>

    <p v-if="error" class="alert" role="alert">
      {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load">
        Spróbuj ponownie
      </button>
    </p>
    <p v-else-if="loading" class="muted">Ładowanie…</p>
    <p v-else-if="groups.length === 0" class="muted">Na razie brak emblematów.</p>

    <template v-else>
      <section v-for="group in groups" :key="group.name" class="group">
        <h2>{{ group.name }}</h2>
        <ul class="grid">
          <li v-for="item in group.items" :key="item.id" class="badge-card panel">
            <img :src="item.image" alt="" class="badge-img" loading="lazy" />
            <div>
              <h3>{{ item.name }}</h3>
              <p class="muted">{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </section>
</template>

<style scoped>
.achievements {
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.achievements h1 {
  margin: 0;
}

.group h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.badge-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.badge-img {
  flex: none;
  width: 4rem;
  height: 4rem;
  object-fit: contain;
}

.badge-card h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.badge-card p {
  margin: 0;
}
</style>
