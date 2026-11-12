<script setup>
import PaginationBar from '@/components/PaginationBar.vue'
import TankBadge from '@/components/TankBadge.vue'
import { usePagination } from '@/composables/usePagination'
import { formatDateTime, formatNumber } from '@/utils/format'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/profiles').ProfileScore[]>} */
  scores: { type: Array, default: () => [] },
  perPage: { type: Number, default: 10 },
  caption: { type: String, default: 'Najlepsze wyniki' },
})

const pager = usePagination(() => props.scores, props.perPage)
</script>

<template>
  <div>
    <div class="table-wrap">
      <table class="table">
        <caption class="sr-only">
          {{
            caption
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="num">#</th>
            <th scope="col" class="num">Damage</th>
            <th scope="col">Czołg</th>
            <th scope="col">Event</th>
            <th scope="col">Data</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(score, index) in pager.items.value"
            :key="`${score.event_id}-${score.tank.tank_id}-${pager.offset.value + index}`"
          >
            <td class="num muted">{{ pager.offset.value + index + 1 }}</td>
            <td class="num damage">{{ formatNumber(score.damage) }}</td>
            <td><TankBadge :tank="score.tank" /></td>
            <td>{{ score.event }}</td>
            <td class="date">{{ formatDateTime(score.damage_date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <PaginationBar
      :page="pager.page.value"
      :page-count="pager.pageCount.value"
      :label="`Strony: ${caption}`"
      @change="pager.page.value = $event"
    />
  </div>
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

.damage {
  font-weight: 700;
}

.date {
  white-space: nowrap;
}
</style>
