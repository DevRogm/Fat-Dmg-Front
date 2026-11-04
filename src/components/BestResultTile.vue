<script setup>
import { formatNumber, formatTankType, formatTier } from '@/utils/format'

defineProps({
  damage: { type: Number, required: true },
  /** @type {import('vue').PropType<import('@/api/profiles').Tank>} */
  tank: { type: Object, required: true },
  eventName: { type: String, default: '' },
  label: { type: String, default: 'Najlepszy wynik' },
})
</script>

<template>
  <div class="best">
    <img v-if="tank.img" :src="tank.img" alt="" class="best-img" />
    <div v-else class="best-img best-img-empty" aria-hidden="true" />
    <div class="best-info">
      <span class="best-label">{{ label }}</span>
      <strong class="best-damage">{{ formatNumber(damage) }}</strong>
      <span class="best-tank">{{ tank.name }}</span>
      <span class="muted">
        Tier {{ formatTier(tank.tier) }} · {{ formatTankType(tank.tank_type) }}
        <template v-if="eventName"> · {{ eventName }}</template>
      </span>
    </div>
  </div>
</template>

<style scoped>
.best {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem;
  background: var(--bg);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
}

.best-img {
  flex: none;
  width: 9rem;
  height: 5.5rem;
  object-fit: contain;
}

.best-img-empty {
  background: var(--border);
  border-radius: 6px;
  opacity: 0.5;
}

.best-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.best-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.best-damage {
  font-size: 2rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.best-tank {
  font-size: 1.125rem;
  font-weight: 600;
}

@media (max-width: 30rem) {
  .best {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
