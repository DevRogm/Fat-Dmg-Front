import { computed, ref, toValue, watch } from 'vue'

/**
 * Paginacja po stronie klienta dla listy, którą backend zwraca w całości.
 * Po podmianie listy (np. inny gracz) wraca na stronę 1.
 *
 * @template T
 * @param {import('vue').MaybeRefOrGetter<T[]>} source
 * @param {number} pageSize
 */
export function usePagination(source, pageSize) {
  const page = ref(1)

  const pageCount = computed(() => Math.max(1, Math.ceil(toValue(source).length / pageSize)))
  const items = computed(() => toValue(source).slice((page.value - 1) * pageSize, page.value * pageSize))
  /** Numer pierwszej pozycji na bieżącej stronie (do ciągłej numeracji). */
  const offset = computed(() => (page.value - 1) * pageSize)

  watch(
    () => toValue(source),
    () => {
      page.value = 1
    },
  )
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count
  })

  return { page, pageCount, items, offset }
}
