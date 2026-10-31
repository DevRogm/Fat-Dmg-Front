<script setup>
import { RouterLink } from 'vue-router'

import TankBadge from '@/components/TankBadge.vue'
import { formatDateTime, formatNumber } from '@/utils/format'

defineProps({
  /** 'guest' | 'inactive' | 'active' */
  status: { type: String, required: true },
  /** Czy trwa event (żeby pokazać sekcję "w evencie"). */
  hasEvent: { type: Boolean, default: false },
  /** Mój wiersz z tabeli aktualnego eventu albo null, jeśli nie dołączyłem. */
  row: { type: Object, default: null },
  /** Moje miejsce w tabeli (1-based) albo null. */
  position: { type: Number, default: null },
  participants: { type: Number, default: 0 },
  /** @type {import('vue').PropType<import('@/api/profiles').ProfileScore[]>} */
  scores: { type: Array, default: () => [] },
  error: { type: String, default: '' },
})
</script>

<template>
  <section class="panel">
    <h2>Twój wynik</h2>

    <p v-if="status === 'guest'" class="muted">
      <RouterLink :to="{ name: 'login' }">Zaloguj się</RouterLink>, aby zobaczyć swoje wyniki.
    </p>

    <p v-else-if="status === 'inactive'" class="muted">
      Aktywuj profil, aby brać udział w eventach i zbierać wyniki.
      <RouterLink :to="{ name: 'activate' }">Przejdź do aktywacji</RouterLink>
    </p>

    <template v-else>
      <div v-if="hasEvent" class="current">
        <template v-if="row">
          <p class="position">
            Miejsce <strong>#{{ position }}</strong>
            <span class="muted"> z {{ participants }}</span>
          </p>
          <p class="best">
            <span class="muted">Najlepszy wynik w evencie</span>
            <strong>{{ formatNumber(row.best_damage) }}</strong>
          </p>
          <TankBadge v-if="row.best_tank" :tank="row.best_tank" />
        </template>
        <p v-else class="muted">Nie bierzesz jeszcze udziału w tym evencie.</p>
      </div>

      <h3 class="subtitle">Twoje najlepsze wyniki</h3>

      <p v-if="error" class="alert" role="alert">{{ error }}</p>
      <p v-else-if="scores.length === 0" class="muted">Brak zapisanych wyników.</p>

      <ol v-else class="scores">
        <li
          v-for="(score, index) in scores"
          :key="`${score.event_id}-${score.tank.tank_id}-${index}`"
        >
          <div class="line">
            <strong class="damage">{{ formatNumber(score.damage) }}</strong>
            <TankBadge :tank="score.tank" />
          </div>
          <div class="meta muted">{{ score.event }} · {{ formatDateTime(score.damage_date) }}</div>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.current {
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.current p {
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

.subtitle {
  margin: 0 0 0.5rem;
  font-size: 0.9375rem;
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.damage {
  font-variant-numeric: tabular-nums;
}

.meta {
  font-size: 0.8125rem;
}
</style>
