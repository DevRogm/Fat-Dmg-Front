<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import * as eventsApi from '@/api/events'
import { useNow } from '@/composables/useNow'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  /** @type {import('vue').PropType<import('@/api/events').Event>} */
  event: { type: Object, required: true },
  /** Czy zalogowany gracz już jest uczestnikiem. */
  participating: { type: Boolean, default: false },
})

const emit = defineEmits(['joined'])

const auth = useAuthStore()
const route = useRoute()
const now = useNow(10_000)

const joining = ref(false)
const error = ref('')

// Można dołączyć do niezakończonego eventu, którego czas jeszcze nie minął.
const open = computed(
  () => !props.event.is_finished && now.value < new Date(props.event.end_date).getTime(),
)

async function join() {
  error.value = ''
  joining.value = true
  try {
    await eventsApi.joinEvent(props.event.id)
    emit('joined')
  } catch (e) {
    error.value = e.message
  } finally {
    joining.value = false
  }
}
</script>

<template>
  <div class="join">
    <p v-if="participating" class="muted">
      {{ open ? 'Bierzesz udział w evencie ✓' : 'Brałeś udział w tym evencie ✓' }}
    </p>

    <template v-else-if="open">
      <button
        v-if="auth.isAuthenticated && auth.isActive"
        class="btn"
        type="button"
        :disabled="joining"
        @click="join"
      >
        {{ joining ? 'Dołączanie…' : 'Dołącz do eventu' }}
      </button>

      <p v-else-if="auth.isAuthenticated" class="muted">
        <RouterLink :to="{ name: 'activate' }">Aktywuj profil</RouterLink>, aby dołączyć.
      </p>

      <p v-else class="muted">
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }">
          Zaloguj się
        </RouterLink>
        , aby dołączyć.
      </p>
    </template>

    <p v-if="error" class="alert" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.join p {
  margin: 0;
}

.join .alert {
  margin-top: 0.75rem;
}
</style>
