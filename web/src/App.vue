<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router"
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <header class="border-b border-stone-200 bg-white">
      <div class="mx-auto flex max-w-3xl flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-4">
        <RouterLink to="/" class="text-lg font-semibold tracking-tight">Usine à livres</RouterLink>
        <span class="text-sm text-stone-500">API Fastify · front Vue 3</span>
      </div>
    </header>
    <main class="mx-auto max-w-3xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
