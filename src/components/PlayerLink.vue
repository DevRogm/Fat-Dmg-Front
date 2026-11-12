<script setup>
import { RouterLink } from 'vue-router'

import PlayerName from '@/components/PlayerName.vue'

defineProps({
  /** Id profilu; gdy brak, pokazujemy sam nick bez linku. */
  profileId: { type: Number, default: null },
  nickname: { type: String, required: true },
  consoleType: { type: String, default: null },
})
</script>

<template>
  <RouterLink
    v-if="profileId"
    class="player-link"
    :to="{ name: 'stats', params: { id: profileId } }"
  >
    <PlayerName :nickname="nickname" :console-type="consoleType" />
  </RouterLink>
  <PlayerName v-else :nickname="nickname" :console-type="consoleType" />
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
}
</style>
