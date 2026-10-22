<script setup lang="ts">
import { onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import { useBookApi } from "../api/book-api.key"
import BookForm from "../components/BookForm.vue"
import ErrorMessage from "../components/ErrorMessage.vue"
import { useApiCall } from "../composables/use-api-call"
import { GENRE_LABELS, type Book, type BookInput } from "../types"

const api = useBookApi()
const { error, pending, call } = useApiCall()

const books = ref<Book[]>([])
const loaded = ref(false)
/** Change à chaque création réussie : le formulaire est recréé, donc vidé. */
const formKey = ref(0)

async function load() {
  const list = await call(() => api.listBooks())
  if (list) books.value = list
  loaded.value = true
}

async function create(input: BookInput) {
  const book = await call(() => api.createBook(input))
  if (!book) return
  formKey.value += 1
  await load()
}

async function remove(book: Book) {
  if (!window.confirm(`Supprimer « ${book.title} » et ses ${book.pageCount} page(s) ?`)) return
  const done = await call(() => api.deleteBook(book.id).then(() => true))
  if (done) await load()
}

onMounted(load)
</script>

<template>
  <div class="grid gap-6">
    <ErrorMessage :error="error" />

    <section class="rounded-lg border border-stone-200 bg-white p-4">
      <h1 class="mb-3 text-base font-semibold">Nouveau livre</h1>
      <BookForm :key="formKey" submit-label="Créer le livre" :pending="pending" @submit="create" />
    </section>

    <section>
      <h2 class="mb-3 text-base font-semibold">Livres <span class="font-normal text-stone-500">({{ books.length }})</span></h2>
      <p v-if="loaded && books.length === 0" class="text-sm text-stone-500">
        Aucun livre. Créer le premier avec le formulaire.
      </p>
      <ul class="grid gap-2">
        <li
          v-for="book in books"
          :key="book.id"
          data-testid="book"
          class="flex items-start justify-between gap-3 rounded-lg border border-stone-200 bg-white p-4"
        >
          <div class="min-w-0">
            <RouterLink :to="{ name: 'book', params: { id: book.id } }" class="font-medium break-words hover:underline">
              {{ book.title }}
            </RouterLink>
            <p class="text-sm break-words text-stone-600">
              {{ book.author }} · {{ GENRE_LABELS[book.genre] }} · {{ book.pageCount }} page{{ book.pageCount > 1 ? "s" : "" }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
            @click="remove(book)"
          >
            Supprimer
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
