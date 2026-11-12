<script setup>
import { formatNumber, formatTankType, formatTier } from '@/utils/format'

defineProps({
  damage: { type: Number, required: true },
  /** @type {import('vue').PropType<import('@/api/profiles').Tank>} */
  tank: { type: Object, required: true },
  eventName: { type: String, default: '' },
  label: { type: String, default: 'Najlepszy wynik' },
  /** Mniejsza wersja do wstawienia w jednej linii z innymi kafelkami. */
  compact: { type: Boolean, default: false },
  /** Zdjęcie wypełnia ramkę w pionie, a wynik jest dosunięty do prawej. */
  fill: { type: Boolean, default: false },
})
</script>

<template>
  <div class="best" :class="{ compact, fill }">
    <div class="best-media">
      <img v-if="tank.img" :src="tank.img" alt="" class="best-img" />
      <div v-else class="best-img best-img-empty" aria-hidden="true" />
    </div>
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

.best-media {
  display: contents;
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

.best.compact {
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
}

.compact .best-img {
  width: 5rem;
  height: 3.25rem;
}

.compact .best-damage {
  font-size: 1.5rem;
}

.compact .best-tank {
  overflow: hidden;
  font-size: 0.9375rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact .best-info {
  font-size: 0.8125rem;
}

@media (max-width: 30rem) {
  .best {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* fill: zdjęcie na całą wysokość ramki (nie zwiększa jej wysokości), wynik po prawej. */
.best.fill {
  flex-direction: row;
  align-items: stretch;
  gap: 0.75rem;
  padding: 0;
  overflow: hidden;
}

.fill .best-media {
  position: relative;
  display: block;
  flex: none;
  align-self: stretch;
  width: 9rem;
}

.fill .best-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.fill .best-info {
  align-items: flex-end;
  margin-left: auto;
  padding: 0.5rem 0.9rem 0.5rem 0;
  text-align: right;
}

@media (max-width: 30rem) {
  .fill .best-media {
    width: 6rem;
  }
}
</style>
