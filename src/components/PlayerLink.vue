<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  /** Id profilu; gdy brak, pokazujemy sam nick bez linku. */
  profileId: { type: Number, default: null },
  nickname: { type: String, required: true },
})
</script>

<template>
  <RouterLink
    v-if="profileId"
    class="player-link"
    :to="{ name: 'stats', params: { id: profileId } }"
  >
    {{ nickname }}
  </RouterLink>
  <span v-else>{{ nickname }}</span>
</template>

<style scoped>
/* Ponad nakładką klikalnej karty wydarzenia (EventCard). */
.player-link {
  position: relative;
  z-index: 1;
  color: inherit;
  text-decoration: none;
}

.player-link:hover {
  color: var(--accent);
  text-decoration: underline;
}
</style>
