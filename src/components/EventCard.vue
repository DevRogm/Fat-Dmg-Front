<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import PlayerLink from '@/components/PlayerLink.vue'
import TankBadge from '@/components/TankBadge.vue'
import { formatDateTime, formatNumber, formatTankType, formatTier } from '@/utils/format'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/events').Event>} */
  event: { type: Object, required: true },
  /** Aktualny czas (ms) – przekazywany z listy, żeby nie tworzyć timera na każdej karcie. */
  now: { type: Number, default: () => Date.now() },
})

const status = computed(() => {
  const { is_finished: finished, start_date: start, end_date: end } = props.event
  if (finished) return { key: 'finished', label: 'Zakończony' }
  if (props.now < new Date(start).getTime()) return { key: 'upcoming', label: 'Wkrótce' }
  if (props.now < new Date(end).getTime()) return { key: 'running', label: 'Trwa' }
  return { key: 'closing', label: 'Podliczanie' }
})

const top = computed(() => props.event.top3 ?? [])
const mine = computed(() => props.event.my_result ?? null)
const mineInTop = computed(
  () => !!mine.value && top.value.some((row) => row.profile_id === mine.value.profile_id),
)
</script>

<template>
  <article class="event">
    <header class="head">
      <h2 class="title">
        <RouterLink class="title-link" :to="{ name: 'event-detail', params: { id: event.id } }">
          {{ event.title }}
        </RouterLink>
      </h2>
      <span class="status" :data-status="status.key">{{ status.label }}</span>
    </header>

    <ul class="chips" aria-label="Wymagania eventu">
      <li class="chip">Tier: {{ formatTier(event.tank_tier) }}</li>
      <li class="chip">Typ czołgu: {{ formatTankType(event.tank_type).toLowerCase() }}</li>
      <li class="chip chip-muted">Graczy: {{ event.participants_count ?? 0 }}</li>
    </ul>

    <p class="dates muted">
      {{ formatDateTime(event.start_date) }} – {{ formatDateTime(event.end_date) }}
    </p>

    <ol v-if="top.length" class="rows" aria-label="Najlepsza trójka">
      <li
        v-for="row in top"
        :key="row.profile_id"
        class="row"
        :class="{ me: row.profile_id === mine?.profile_id }"
      >
        <span class="place">{{ row.place ?? '—' }}</span>
        <span class="who">
          <strong class="nick">
            <PlayerLink
              :profile-id="row.profile_id"
              :nickname="row.nickname"
              :console-type="row.console"
            />
          </strong>
          <TankBadge :tank="row.best_tank" />
        </span>
        <span class="damage">{{ formatNumber(row.best_damage) }}</span>
      </li>
    </ol>
    <p v-else class="muted empty">Brak wyników.</p>

    <template v-if="mine && !mineInTop">
      <p class="gap" aria-hidden="true">⋯</p>
      <ol class="rows" aria-label="Twój wynik">
        <li class="row me">
          <span class="place">{{ mine.place ?? '—' }}</span>
          <span class="who">
            <strong class="nick">
              <PlayerLink
                :profile-id="mine.profile_id"
                :nickname="mine.nickname"
                :console-type="mine.console"
              />
            </strong>
            <TankBadge :tank="mine.best_tank" />
          </span>
          <span class="damage">{{ formatNumber(mine.best_damage) }}</span>
        </li>
      </ol>
    </template>
  </article>
</template>

<style scoped>
.event {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.title {
  margin: 0;
  font-size: 1.125rem;
  overflow-wrap: anywhere;
}

.status {
  flex: none;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.status[data-status='running'] {
  color: var(--accent);
  border-color: var(--accent);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  padding: 0.1rem 0.55rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}

.chip-muted {
  color: var(--text-muted);
  border-color: var(--border);
}

.dates {
  margin: 0;
}

.rows {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.row {
  display: grid;
  grid-template-columns: 1.75rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--border);
}

.row:last-child {
  border-bottom: 0;
}

.row.me {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border-radius: 6px;
}

.place {
  font-weight: 700;
  color: var(--text-muted);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 0.875rem;
}

.nick {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.damage {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.gap {
  margin: 0;
  text-align: center;
  line-height: 1;
  color: var(--text-muted);
}

.empty {
  margin: 0;
}
.title-link {
  color: inherit;
  text-decoration: none;
}

/* Cała karta jest klikalna, a link pozostaje jednym punktem dla klawiatury. */
.title-link::after {
  position: absolute;
  inset: 0;
  content: '';
}

.event:hover,
.event:focus-within {
  border-color: var(--accent);
}

.title-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
