<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  /** Lista rzeczy, które mają się tu pojawić. */
  planned: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="placeholder">
    <h1>{{ title }}</h1>
    <p class="badge-wip">W przygotowaniu</p>
    <p>{{ description }}</p>

    <template v-if="planned.length">
      <h2>Planowane</h2>
      <ul>
        <li v-for="item in planned" :key="item">{{ item }}</li>
      </ul>
    </template>
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

.placeholder h2 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1rem;
}

.placeholder ul {
  margin: 0;
  padding-left: 1.25rem;
}

.badge-wip {
  display: inline-block;
  margin: 0 0 0.75rem;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}
</style>
