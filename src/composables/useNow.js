import { onScopeDispose, ref } from 'vue'

/** Reaktywny "teraz" (ms), odświeżany co `intervalMs`. Sprząta się razem z komponentem. */
export function useNow(intervalMs = 1000) {
  const now = ref(Date.now())
  const id = setInterval(() => {
    now.value = Date.now()
  }, intervalMs)
  onScopeDispose(() => clearInterval(id))
  return now
}
