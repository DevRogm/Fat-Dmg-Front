<script setup>
import { computed, onMounted, ref } from 'vue'

import * as newsApi from '@/api/news'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 20

/** @type {import('vue').Ref<import('@/api/news').NewsPost[]>} */
const posts = ref([])
const count = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')

const pageCount = computed(() => Math.max(1, Math.ceil(count.value / PAGE_SIZE)))

async function load(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const data = await newsApi.getNews(nextPage)
    posts.value = data.results
    count.value = data.count
    page.value = nextPage
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => load(1))
</script>

<template>
  <section class="news container">
    <h1>Aktualności</h1>

    <p v-if="error" class="alert" role="alert">
      {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load()">
        Spróbuj ponownie
      </button>
    </p>
    <p v-else-if="loading && posts.length === 0" class="muted">Ładowanie…</p>
    <p v-else-if="posts.length === 0" class="muted">Na razie brak newsów.</p>

    <template v-else>
      <article v-for="post in posts" :key="post.id" class="panel post">
        <h2>{{ post.title }}</h2>
        <p class="muted">
          <time :datetime="post.published_at">{{ formatDateTime(post.published_at) }}</time>
        </p>
        <p class="content">{{ post.content }}</p>
      </article>

      <nav v-if="pageCount > 1" class="pager" aria-label="Strony aktualności">
        <button
          class="btn btn-secondary btn-small"
          type="button"
          :disabled="page <= 1 || loading"
          @click="load(page - 1)"
        >
          Nowsze
        </button>
        <span class="muted">Strona {{ page }} z {{ pageCount }}</span>
        <button
          class="btn btn-secondary btn-small"
          type="button"
          :disabled="page >= pageCount || loading"
          @click="load(page + 1)"
        >
          Starsze
        </button>
      </nav>
    </template>
  </section>
</template>

<style scoped>
.news {
  max-width: 44rem;
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news h1 {
  margin: 0;
}

.post h2 {
  margin-bottom: 0.25rem;
}

.post p {
  margin: 0;
}

.content {
  margin-top: 0.75rem !important;
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
</style>
