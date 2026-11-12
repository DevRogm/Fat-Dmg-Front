<script setup>
import { computed, ref, watch } from 'vue'

import PlayerLink from '@/components/PlayerLink.vue'
import TankBadge from '@/components/TankBadge.vue'
import { formatNumber } from '@/utils/format'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/events').LeaderboardRow[]>} */
  rows: { type: Array, default: () => [] },
  /** Id profilu zalogowanego gracza – jego wiersz jest wyróżniony. */
  highlightProfileId: { type: Number, default: null },
  /** Ile wierszy pokazać (Top N, bez stron); null = wszystkie. Ignorowane z pageSize. */
  limit: { type: Number, default: 20 },
  /** Gdy ustawione: tabela jest dzielona na strony po tyle wierszy. */
  pageSize: { type: Number, default: null },
  title: { type: String, default: 'Tabela wyników' },
})

const page = ref(1)

const paged = computed(() => props.pageSize != null)
const pageCount = computed(() =>
  paged.value ? Math.max(1, Math.ceil(props.rows.length / props.pageSize)) : 1,
)
// Numer pierwszego wiersza na bieżącej stronie (0-based) – do liczenia miejsc.
const offset = computed(() => (paged.value ? (page.value - 1) * props.pageSize : 0))

const visibleRows = computed(() => {
  if (paged.value) return props.rows.slice(offset.value, offset.value + props.pageSize)
  return props.limit == null ? props.rows : props.rows.slice(0, props.limit)
})
const truncated = computed(
  () => !paged.value && props.limit != null && props.rows.length > props.limit,
)
const rangeEnd = computed(() => Math.min(offset.value + props.pageSize, props.rows.length))

// Dane odświeżają się w tle (może ubyć uczestników) – nie zostajemy za ostatnią stroną.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

const caption = computed(() => {
  if (paged.value) return `${props.title}, strona ${page.value} z ${pageCount.value}`
  return props.limit == null ? props.title : `Top ${props.limit}`
})
</script>

<template>
  <section class="panel board">
    <h2>{{ title }}</h2>

    <p v-if="rows.length === 0" class="muted">Nikt jeszcze nie dołączył do eventu.</p>

    <template v-else>
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
              <th scope="col">Gracz</th>
              <th scope="col" class="num">Damage</th>
              <th scope="col">Czołg</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in visibleRows"
              :key="row.profile_id"
              :class="{ me: row.profile_id === highlightProfileId }"
            >
              <td class="num place">
                {{ row.best_damage == null ? '—' : (row.place ?? offset + index + 1) }}
              </td>
              <td class="nickname">
                <PlayerLink
                  :profile-id="row.profile_id"
                  :nickname="row.nickname"
                  :console-type="row.console"
                />
              </td>
              <td class="num damage">{{ formatNumber(row.best_damage) }}</td>
              <td><TankBadge :tank="row.best_tank" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="truncated" class="muted more">
        Pokazano {{ limit }} z {{ rows.length }} uczestników.
      </p>

      <nav v-if="paged && pageCount > 1" class="pager" aria-label="Strony tabeli wyników">
        <p class="muted" aria-live="polite">
          Wyniki {{ offset + 1 }}–{{ rangeEnd }} z {{ rows.length }}
        </p>
        <div class="pager-buttons">
          <button
            class="btn btn-secondary btn-small"
            type="button"
            :disabled="page <= 1"
            @click="page--"
          >
            ← Poprzednia
          </button>
          <span class="muted">Strona {{ page }} z {{ pageCount }}</span>
          <button
            class="btn btn-secondary btn-small"
            type="button"
            :disabled="page >= pageCount"
            @click="page++"
          >
            Następna →
          </button>
        </div>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
}

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

.pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  padding-top: 0.75rem;
  margin-top: auto;
}

.pager p {
  margin: 0;
}

.pager-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
</style>
