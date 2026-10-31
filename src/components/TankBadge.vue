<script setup>
defineProps({
  /** @type {import('vue').PropType<import('@/api/profiles').Tank|null>} */
  tank: { type: Object, default: null },
})
</script>

<template>
  <span v-if="tank" class="tank">
    <img v-if="tank.img" :src="tank.img" alt="" class="tank-img" loading="lazy" />
    <span v-else class="tank-img tank-img-empty" aria-hidden="true" />
    <span class="tank-name">{{ tank.name }}</span>
  </span>
  <span v-else class="muted">—</span>
</template>

<style scoped>
.tank {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.tank-img {
  flex: none;
  width: 3rem;
  height: 1.75rem;
  object-fit: contain;
}

.tank-img-empty {
  background: var(--border);
  border-radius: 4px;
  opacity: 0.5;
}

.tank-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
