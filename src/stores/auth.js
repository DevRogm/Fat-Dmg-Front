import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/api/auth'
import * as profilesApi from '@/api/profiles'
import { tokens } from '@/api/tokens'

export const useAuthStore = defineStore('auth', () => {
  const hasToken = ref(Boolean(tokens.getAccess()))
  /** @type {import('vue').Ref<import('@/api/profiles').Profile|null>} */
  const profile = ref(null)

  const isAuthenticated = computed(() => hasToken.value)
  const isActive = computed(() => profile.value?.is_active === true)

  function clearSession() {
    tokens.clear()
    hasToken.value = false
    profile.value = null
  }

  async function fetchProfile() {
    profile.value = await profilesApi.getMe()
    return profile.value
  }

  async function login(username, password) {
    const data = await authApi.login(username, password)
    tokens.set(data)
    hasToken.value = true
    try {
      await fetchProfile()
    } catch (e) {
      clearSession()
      throw e
    }
  }

  /** Rejestruje i od razu loguje. */
  async function register(username, password) {
    await authApi.register(username, password)
    await login(username, password)
  }

  function logout() {
    clearSession()
  }

  // Inicjalizacja sesji – wołana raz, przed pierwszą nawigacją.
  let initPromise = null
  function init() {
    if (!initPromise) {
      initPromise = (async () => {
        if (!hasToken.value) return
        try {
          await fetchProfile()
        } catch (e) {
          if (e.status === 401 || e.status === 403) clearSession()
          // przy błędzie sieci zostawiamy tokeny – użytkownik może spróbować ponownie
        }
      })()
    }
    return initPromise
  }

  return { profile, isAuthenticated, isActive, fetchProfile, login, register, logout, init }
})
