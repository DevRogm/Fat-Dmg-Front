<script setup>
import { computed, onMounted, ref } from 'vue'

import PaginationBar from '@/components/PaginationBar.vue'
import * as youtubeApi from '@/api/youtube'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 12 // musi się zgadzać z YoutubePagination.page_size w backendzie

/** @type {import('vue').Ref<import('@/api/youtube').YoutubeVideo[]>} */
const videos = ref([])
const count = ref(0)
const page = ref(1)
const loading = ref(true)
const error = ref('')

const pageCount = computed(() => Math.max(1, Math.ceil(count.value / PAGE_SIZE)))

async function load(nextPage = page.value) {
  loading.value = true
  error.value = ''
  try {
    const data = await youtubeApi.getVideos(nextPage)
    videos.value = data.results
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
  <section class="youtube container">
    <h1>Kanał YT</h1>

    <p v-if="error" class="alert" role="alert">
      {{ error }}
      <button class="btn btn-secondary btn-small" type="button" @click="load()">
        Spróbuj ponownie
      </button>
    </p>
    <p v-else-if="loading && videos.length === 0" class="muted">Ładowanie…</p>
    <p v-else-if="videos.length === 0" class="muted">Na razie brak filmów.</p>

    <template v-else>
      <div class="grid">
        <article v-for="video in videos" :key="video.id" class="panel video">
          <a
            class="thumb"
            :href="video.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`Obejrzyj na YouTube: ${video.title || 'film'}`"
          >
            <img :src="video.thumbnail" :alt="video.title" loading="lazy" />
            <span class="play" aria-hidden="true">▶</span>
          </a>
          <h2>
            <a :href="video.url" target="_blank" rel="noopener noreferrer">
              {{ video.title || 'Film z YouTube' }}
            </a>
          </h2>
          <p class="muted meta">
            <template v-if="video.author">{{ video.author }} · </template>
            <time :datetime="video.added_at">{{ formatDateTime(video.added_at) }}</time>
          </p>
          <p v-if="video.description" class="description">{{ video.description }}</p>
        </article>
      </div>

      <PaginationBar
        :page="page"
        :page-count="pageCount"
        :disabled="loading"
        label="Strony filmów"
        prev-label="Nowsze"
        next-label="Starsze"
        @change="load"
      />
    </template>
  </section>
</template>

<style scoped>
.youtube {
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.youtube h1 {
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1rem;
}

.video {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.video h2 {
  margin: 0;
  font-size: 1.05rem;
  overflow-wrap: anywhere;
}

.video p {
  margin: 0;
}

.thumb {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #000;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 2.5rem;
  color: #fff;
  text-shadow: 0 0 12px rgb(0 0 0 / 0.7);
  background: rgb(0 0 0 / 0.15);
  transition: background 0.15s;
}

.thumb:hover .play,
.thumb:focus-visible .play {
  background: rgb(0 0 0 / 0.35);
}

.description {
  white-space: pre-line;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
