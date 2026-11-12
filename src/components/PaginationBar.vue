<script setup>
defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: 'Strony' },
  prevLabel: { type: String, default: 'Poprzednia' },
  nextLabel: { type: String, default: 'Następna' },
})

defineEmits(['change'])
</script>

<template>
  <nav v-if="pageCount > 1" class="pager" :aria-label="label">
    <button
      class="btn btn-secondary btn-small"
      type="button"
      :disabled="disabled || page <= 1"
      @click="$emit('change', page - 1)"
    >
      {{ prevLabel }}
    </button>
    <span class="muted">Strona {{ page }} z {{ pageCount }}</span>
    <button
      class="btn btn-secondary btn-small"
      type="button"
      :disabled="disabled || page >= pageCount"
      @click="$emit('change', page + 1)"
    >
      {{ nextLabel }}
    </button>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
