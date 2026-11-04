<script setup>
import PlayerLink from '@/components/PlayerLink.vue'
import TankBadge from '@/components/TankBadge.vue'
import { formatDateTime, formatNumber } from '@/utils/format'

defineProps({
  /** @type {import('vue').PropType<import('@/api/events').Battle[]>} */
  battles: { type: Array, default: () => [] },
  /** Pokazuj nick gracza (dla bitew innych graczy). */
  showNickname: { type: Boolean, default: false },
})
</script>

<template>
  <ol v-if="battles.length" class="battles">
    <li
      v-for="(battle, index) in battles"
      :key="`${battle.nickname ?? battle.event_id}-${battle.damage_date}-${index}`"
    >
      <div class="line">
        <strong class="damage">{{ formatNumber(battle.damage) }}</strong>
        <TankBadge :tank="battle.tank" />
      </div>
      <div class="meta muted">
        <template v-if="showNickname">
          <PlayerLink :profile-id="battle.profile_id" :nickname="battle.nickname" /> ·
        </template>
        <template v-if="battle.event">{{ battle.event }} · </template>
        {{ formatDateTime(battle.damage_date) }}
      </div>
    </li>
  </ol>
  <p v-else class="muted empty">—</p>
</template>

<style scoped>
.battles {
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

.empty {
  margin: 0;
}
</style>
