<script setup lang="ts">
import type { ApiError } from "../api/book-api"

defineProps<{ error: ApiError | null }>()
</script>

<template>
  <div
    v-if="error && error.notImplemented"
    role="alert"
    class="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
  >
    <p class="font-semibold">{{ error.message }}</p>
    <p class="mt-1 break-words">
      <code class="rounded bg-amber-100 px-1">{{ error.route }}</code> : écrire cette route dans
      <code class="rounded bg-amber-100 px-1">api/src/</code>, puis recharger la page.
    </p>
  </div>
  <div
    v-else-if="error"
    role="alert"
    class="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
  >
    <p class="font-semibold">Erreur {{ error.status > 0 ? error.status : "" }}</p>
    <p class="mt-1 break-words">{{ error.message }}</p>
  </div>
</template>
