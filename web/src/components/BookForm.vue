<script setup lang="ts">
import { reactive } from "vue"
import { GENRE_LABELS, GENRES, type BookInput } from "../types"

const props = defineProps<{ initial?: BookInput; submitLabel: string; pending?: boolean }>()
const emit = defineEmits<{ submit: [input: BookInput]; cancel: [] }>()

const form = reactive<BookInput>({
  title: props.initial?.title ?? "",
  author: props.initial?.author ?? "",
  genre: props.initial?.genre ?? "roman",
})

function submit() {
  emit("submit", { title: form.title, author: form.author, genre: form.genre })
}
</script>

<template>
  <form class="grid gap-3 sm:grid-cols-2" @submit.prevent="submit">
    <label class="grid gap-1 text-sm sm:col-span-2">
      <span class="font-medium">Titre</span>
      <input
        v-model="form.title"
        name="title"
        required
        maxlength="200"
        class="min-w-0 rounded-md border border-stone-300 bg-white px-3 py-2 focus:border-stone-500 focus:outline-none"
      />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="font-medium">Auteur</span>
      <input
        v-model="form.author"
        name="author"
        required
        maxlength="120"
        class="min-w-0 rounded-md border border-stone-300 bg-white px-3 py-2 focus:border-stone-500 focus:outline-none"
      />
    </label>
    <label class="grid gap-1 text-sm">
      <span class="font-medium">Genre</span>
      <select
        v-model="form.genre"
        name="genre"
        class="min-w-0 rounded-md border border-stone-300 bg-white px-3 py-2 focus:border-stone-500 focus:outline-none"
      >
        <option v-for="genre in GENRES" :key="genre" :value="genre">{{ GENRE_LABELS[genre] }}</option>
      </select>
    </label>
    <div class="flex flex-wrap gap-2 sm:col-span-2">
      <button
        type="submit"
        :disabled="pending"
        class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
      >
        {{ submitLabel }}
      </button>
      <button
        v-if="initial"
        type="button"
        class="rounded-md border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
        @click="emit('cancel')"
      >
        Annuler
      </button>
    </div>
  </form>
</template>
