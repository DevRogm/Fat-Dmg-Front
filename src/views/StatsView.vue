<script setup>
import PlaceholderPage from '@/components/PlaceholderPage.vue'
</script>

<template>
  <PlaceholderPage
    title="Statystyki"
    description="Statystyki Twoje albo dowolnego gracza zarejestrowanego w FatDmg."
    :planned="[
      'Własne statystyki: najlepsze wyniki, udział w eventach, miejsca.',
      'Wyszukiwarka graczy po nicku (tylko zarejestrowani w FatDmg).',
      'Statystyki wybranego gracza w tym samym formacie co własne.',
    ]"
  />
</template>
