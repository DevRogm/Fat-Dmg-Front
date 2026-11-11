<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section class="placeholder">
    <h1>{{ title }}</h1>
    <p class="badge-wip">W przygotowaniu</p>
    <p v-if="description">{{ description }}</p>
  </section>
</template>

<style scoped>
.placeholder {
  max-width: 40rem;
  margin: 1rem auto;
  padding: 1.5rem;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
}

.placeholder h1 {
  margin-bottom: 0.5rem;
}

.badge-wip {
  display: inline-block;
  margin: 0;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}
</style>
