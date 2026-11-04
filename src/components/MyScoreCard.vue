<script setup>
import { RouterLink } from 'vue-router'

import BattleList from '@/components/BattleList.vue'
import TankBadge from '@/components/TankBadge.vue'
import { formatNumber } from '@/utils/format'

defineProps({
  /** 'guest' | 'inactive' | 'active' */
  status: { type: String, required: true },
  /** Mój wiersz z tabeli aktualnego eventu albo null, jeśli nie dołączyłem. */
  row: { type: Object, default: null },
  /** Moje miejsce w tabeli (1-based) albo null, gdy brak wyniku. */
  position: { type: Number, default: null },
  participants: { type: Number, default: 0 },
  /** Moje ostatnie bitwy w tym evencie. */
  battles: { type: Array, default: () => [] },
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
      <div class="current">
        <p class="position">
          Miejsce <strong>{{ position ? `#${position}` : '—' }}</strong>
          <span v-if="position" class="muted"> z {{ participants }}</span>
        </p>
        <p class="best">
          <span class="muted">Najlepszy wynik w evencie</span>
          <strong>{{ formatNumber(row?.best_damage) }}</strong>
        </p>
        <TankBadge v-if="row?.best_tank" :tank="row.best_tank" />
      </div>

      <h3 class="subtitle">Twoje ostatnie bitwy</h3>
      <BattleList :battles="battles" />
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
</style>
