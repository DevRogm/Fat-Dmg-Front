<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import logo from '@/assets/logo.png'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)

// Profil załadowany, ale jeszcze nieaktywny (profil == null np. przy błędzie sieci)
const needsActivation = computed(() => auth.isAuthenticated && !!auth.profile && !auth.isActive)
const displayName = computed(() => auth.profile?.full_nickname ?? 'Nowy gracz')

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

async function logout() {
  auth.logout()
  await router.push({ name: 'home' })
}
</script>

<template>
  <header class="header">
    <div class="container header-inner">
      <RouterLink :to="{ name: 'home' }" class="brand" aria-label="FatDmg">
        <img :src="logo" alt="FatDmg" class="brand-logo" />
      </RouterLink>

      <button
        class="menu-toggle btn btn-secondary btn-small"
        type="button"
        aria-controls="main-nav"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        Menu
      </button>

      <nav id="main-nav" class="nav" :class="{ open: menuOpen }" aria-label="Główna nawigacja">
        <div class="nav-links">
          <RouterLink :to="{ name: 'home' }">Start</RouterLink>
          <template v-if="auth.isAuthenticated">
            <RouterLink :to="{ name: 'profile' }">Profil</RouterLink>
            <RouterLink v-if="needsActivation" :to="{ name: 'activate' }">Aktywacja</RouterLink>
          </template>
        </div>

        <div class="nav-user">
          <template v-if="auth.isAuthenticated">
            <span class="user-name">{{ displayName }}</span>
            <span v-if="needsActivation" class="badge">nieaktywny</span>
            <button class="btn btn-secondary btn-small" type="button" @click="logout">
              Wyloguj
            </button>
          </template>
          <template v-else>
            <RouterLink class="btn btn-secondary btn-small" :to="{ name: 'login' }">
              Zaloguj
            </RouterLink>
            <RouterLink class="btn btn-small" :to="{ name: 'register' }">Rejestracja</RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  min-height: 3.5rem;
}

.brand {
  display: flex;
  align-items: center;
  padding-block: 0.25rem;
}

.brand-logo {
  display: block;
  height: 6rem;
  width: auto;
}

.menu-toggle {
  display: none;
  margin-left: auto;
}

.nav {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1.5rem;
}

.nav-links,
.nav-user {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}

.nav-links a {
  padding: 0.25rem 0;
  color: var(--text-muted);
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.nav-links a:hover {
  color: var(--text);
}

.nav-links a.router-link-exact-active {
  color: var(--text);
  border-bottom-color: var(--accent);
}

.user-name {
  font-weight: 600;
}

.badge {
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 999px;
}

/* Linki wyglądające jak przyciski nie dostają podkreślenia */
.nav-user a.btn {
  text-decoration: none;
}

@media (max-width: 40rem) {
  .brand-logo {
    height: 3rem;
  }

  .menu-toggle {
    display: inline-block;
  }

  .nav {
    display: none;
    flex-basis: 100%;
    flex-direction: column;
    align-items: stretch;
    padding-bottom: 0.75rem;
  }

  .nav.open {
    display: flex;
  }

  .nav-links,
  .nav-user {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
