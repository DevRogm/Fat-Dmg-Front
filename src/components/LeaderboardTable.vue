<script setup>
import { computed } from 'vue'

import TankBadge from '@/components/TankBadge.vue'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/events').LeaderboardRow[]>} */
  rows: { type: Array, default: () => [] },
  /** Nick zalogowanego gracza – jego wiersz jest wyróżniony. */
  highlightNickname: { type: String, default: null },
  limit: { type: Number, default: 20 },
})

const visibleRows = computed(() => props.rows.slice(0, props.limit))
</script>

<template>
  <section class="panel">
    <h2>Tabela wyników</h2>

    <p v-if="rows.length === 0" class="muted">Nikt jeszcze nie dołączył do eventu.</p>

    <template v-else>
      <div class="table-wrap">
        <table class="table">
          <caption class="sr-only">
            Top
            {{
              limit
            }}
            aktualnego eventu
          </caption>
          <thead>
            <tr>
              <th scope="col" class="num">#</th>
              <th scope="col">Gracz</th>
              <th scope="col" class="num">Damage</th>
              <th scope="col">Czołg</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in visibleRows"
              :key="row.nickname"
              :class="{ me: row.nickname === highlightNickname }"
            >
              <td class="num place">{{ index + 1 }}</td>
              <td class="nickname">{{ row.nickname }}</td>
              <td class="num damage">{{ formatNumber(row.best_damage) }}</td>
              <td><TankBadge :tank="row.best_tank" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="rows.length > limit" class="muted more">
        Pokazano {{ limit }} z {{ rows.length }} uczestników.
      </p>
    </template>
  </section>
</template>

<style scoped>
.table-wrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9375rem;
}

.table th,
.table td {
  padding: 0.4rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.table th {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.place {
  color: var(--text-muted);
}

.nickname {
  font-weight: 600;
}

.damage {
  font-weight: 700;
}

.me {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.more {
  margin: 0.75rem 0 0;
}
</style>
