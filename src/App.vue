<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()

const showActivationBanner = computed(
  () => auth.isAuthenticated && !!auth.profile && !auth.isActive && route.name !== 'activate',
)
</script>

<template>
  <AppHeader />

  <div v-if="showActivationBanner" class="banner">
    <div class="container">
      Twój profil nie jest jeszcze aktywny, więc nie możesz dołączać do eventów.
      <RouterLink :to="{ name: 'activate' }">Aktywuj konto</RouterLink>
    </div>
  </div>

  <main class="container main">
    <RouterView />
  </main>
</template>

<style scoped>
.main {
  padding-block: 1.5rem;
}
</style>
