<script setup>
import { computed } from 'vue'

import { useNow } from '@/composables/useNow'
import { formatDateTime, formatDuration, formatTankType, formatTier } from '@/utils/format'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/events').Event|null>} */
  event: { type: Object, default: null },
})

const now = useNow(1000)

const phase = computed(() => {
  const start = new Date(props.event.start_date).getTime()
  const end = new Date(props.event.end_date).getTime()

  if (now.value < start) {
    return { state: 'upcoming', label: 'Do startu', value: formatDuration(start - now.value) }
  }
  if (now.value < end) {
    return { state: 'running', label: 'Do końca', value: formatDuration(end - now.value) }
  }
  return { state: 'ended', label: 'Czas minął', value: 'Czekamy na podsumowanie' }
})
</script>

<template>
  <section class="panel">
    <h2>Aktualny event</h2>

    <template v-if="event">
      <h3 class="title">{{ event.title }}</h3>

      <ul class="chips" aria-label="Wymagania eventu">
        <li class="chip">Tier {{ formatTier(event.tank_tier) }}</li>
        <li class="chip">{{ formatTankType(event.tank_type) }}</li>
      </ul>

      <p v-if="event.description" class="description">{{ event.description }}</p>

      <dl class="dates">
        <div>
          <dt>Start</dt>
          <dd>{{ formatDateTime(event.start_date) }}</dd>
        </div>
        <div>
          <dt>Koniec</dt>
          <dd>{{ formatDateTime(event.end_date) }}</dd>
        </div>
      </dl>

      <div class="countdown" :data-state="phase.state" role="timer">
        <span class="countdown-label">{{ phase.label }}</span>
        <span class="countdown-value">{{ phase.value }}</span>
      </div>

      <div class="footer">
        <slot name="footer" />
      </div>

      <p class="muted author">Organizator: {{ event.author }}</p>
    </template>

    <p v-else class="muted">Obecnie nie trwa żaden event. Zajrzyj tu później.</p>
  </section>
</template>

<style scoped>
.title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 0.75rem;
  padding: 0;
  list-style: none;
}

.chip {
  padding: 0.15rem 0.6rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}

.description {
  margin: 0 0 1rem;
  white-space: pre-line;
}

.dates {
  display: grid;
  gap: 0.5rem;
  margin: 0 0 1rem;
}

.dates dt {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dates dd {
  margin: 0;
  font-weight: 600;
}

.countdown {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.countdown[data-state='running'] {
  border-color: var(--accent);
}

.countdown-label {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.countdown-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.countdown[data-state='ended'] .countdown-value {
  font-size: 1rem;
}

.footer {
  margin-top: 1rem;
}

.footer:empty {
  display: none;
}

.author {
  margin: 1rem 0 0;
}
</style>
