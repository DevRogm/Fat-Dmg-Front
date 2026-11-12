<script setup>
import { computed, onMounted, ref } from 'vue'

import * as newsApi from '@/api/news'
import PaginationBar from '@/components/PaginationBar.vue'
import PlayerName from '@/components/PlayerName.vue'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 10 // musi się zgadzać z NewsPagination.page_size w backendzie

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
          <template v-if="post.author">
            · Autor: <PlayerName :nickname="post.author" :console-type="post.author_console" />
          </template>
        </p>
        <p class="content">{{ post.content }}</p>
      </article>

      <PaginationBar
        :page="page"
        :page-count="pageCount"
        :disabled="loading"
        label="Strony aktualności"
        prev-label="Nowsze"
        next-label="Starsze"
        @change="load"
      />
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
</style>
