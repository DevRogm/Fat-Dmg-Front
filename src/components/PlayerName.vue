<script setup>
import { computed } from 'vue'

import { formatConsole } from '@/utils/format'

const props = defineProps({
  /** Sam nick, bez przedrostka konsoli (-x / -p). */
  nickname: { type: String, default: null },
  /** 'x' (Xbox) | 'p' (PlayStation) | null – decyduje o kolorze podkreślenia. */
  consoleType: { type: String, default: null },
  /** Tekst, gdy gracz nie ma nicku. */
  fallback: { type: String, default: '—' },
})

const consoleName = computed(() => (props.consoleType ? formatConsole(props.consoleType) : null))
</script>

<template>
  <span
    class="player-name"
    :class="{ xbox: consoleType === 'x', playstation: consoleType === 'p' }"
    :title="consoleName ?? undefined"
  >
    <template v-if="nickname">
      {{ nickname }}<span v-if="consoleName" class="sr-only"> ({{ consoleName }})</span>
    </template>
    <template v-else>{{ fallback }}</template>
  </span>
</template>

<style scoped>
/* Konsolę oznacza kolor podkreślenia nicku – bez pisania przedrostka. */
.xbox,
.playstation {
  text-decoration-line: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
}

.xbox {
  text-decoration-color: var(--console-xbox);
}

.playstation {
  text-decoration-color: var(--console-playstation);
}
</style>
