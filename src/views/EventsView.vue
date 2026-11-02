<script setup>
import PlaceholderPage from '@/components/PlaceholderPage.vue'
</script>

<template>
  <PlaceholderPage
    title="Wydarzenia"
    description="Historia wydarzeń FatDmg: aktualny event i wszystkie zakończone."
    :planned="[
      'Lista wydarzeń z filtrem: trwające / zakończone, tier, typ czołgu.',
      'Szczegóły wydarzenia: opis, daty, wymagania i pełna tabela wyników.',
      'Twoje miejsce i najlepszy wynik w każdym evencie, w którym brałeś udział.',
    ]"
  />
</template>
