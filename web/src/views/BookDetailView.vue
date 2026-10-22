<script setup lang="ts">
import { ref, watch } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { useBookApi } from "../api/book-api.key"
import BookForm from "../components/BookForm.vue"
import ErrorMessage from "../components/ErrorMessage.vue"
import { useApiCall } from "../composables/use-api-call"
import { GENRE_LABELS, type BookInput, type BookWithPages, type Page } from "../types"

const props = defineProps<{ id: number }>()

const api = useBookApi()
const router = useRouter()
const { error, pending, call } = useApiCall()

const book = ref<BookWithPages | null>(null)
const editingBook = ref(false)
const newPage = ref("")
const editingPageId = ref<number | null>(null)
const pageDraft = ref("")

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" })

async function load() {
  const found = await call(() => api.getBook(props.id))
  if (found) book.value = found
}

async function saveBook(input: BookInput) {
  const saved = await call(() => api.updateBook(props.id, input))
  if (!saved) return
  editingBook.value = false
  await load()
}

async function removeBook() {
  if (!book.value || !window.confirm(`Supprimer « ${book.value.title} » et toutes ses pages ?`)) return
  const done = await call(() => api.deleteBook(props.id).then(() => true))
  if (done) await router.push({ name: "books" })
}

async function addPage() {
  const page = await call(() => api.addPage(props.id, newPage.value))
  if (!page) return
  newPage.value = ""
  await load()
}

function startEditing(page: Page) {
  editingPageId.value = page.id
  pageDraft.value = page.content
}

async function savePage(page: Page) {
  const saved = await call(() => api.updatePage(props.id, page.id, pageDraft.value))
  if (!saved) return
  editingPageId.value = null
  await load()
}

async function removePage(page: Page) {
  if (!window.confirm(`Supprimer la page ${page.number} ? Les suivantes seront renumérotées.`)) return
  const done = await call(() => api.deletePage(props.id, page.id).then(() => true))
  if (done) await load()
}

watch(() => props.id, load, { immediate: true })
</script>

<template>
  <div class="grid gap-6">
    <RouterLink to="/" class="text-sm text-stone-600 hover:underline">&larr; Tous les livres</RouterLink>

    <ErrorMessage :error="error" />

    <template v-if="book">
      <section class="rounded-lg border border-stone-200 bg-white p-4">
        <template v-if="!editingBook">
          <h1 class="text-xl font-semibold break-words" data-testid="book-title">{{ book.title }}</h1>
          <p class="mt-1 text-sm break-words text-stone-600">
            {{ book.author }} · {{ GENRE_LABELS[book.genre] }} · <span data-testid="page-count">{{ book.pageCount }}</span>
            page{{ book.pageCount > 1 ? "s" : "" }}
          </p>
          <p class="mt-1 text-xs text-stone-500">Créé le {{ dateFormat.format(new Date(book.createdAt)) }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-md border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
              @click="editingBook = true"
            >
              Modifier le livre
            </button>
            <button
              type="button"
              class="rounded-md border border-stone-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              @click="removeBook"
            >
              Supprimer le livre
            </button>
          </div>
        </template>
        <BookForm
          v-else
          :initial="{ title: book.title, author: book.author, genre: book.genre }"
          submit-label="Enregistrer"
          :pending="pending"
          @submit="saveBook"
          @cancel="editingBook = false"
        />
      </section>

      <section>
        <h2 class="mb-3 text-base font-semibold">Pages</h2>
        <p v-if="book.pages.length === 0" class="text-sm text-stone-500">Aucune page pour l'instant.</p>
        <ol class="grid gap-2">
          <li
            v-for="page in book.pages"
            :key="page.id"
            data-testid="page"
            class="rounded-lg border border-stone-200 bg-white p-4"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="text-xs font-semibold tracking-wide text-stone-500 uppercase" data-testid="page-number">
                Page {{ page.number }}
              </span>
              <div v-if="editingPageId !== page.id" class="flex gap-2">
                <button type="button" class="text-sm text-stone-700 hover:underline" @click="startEditing(page)">
                  Modifier
                </button>
                <button type="button" class="text-sm text-red-700 hover:underline" @click="removePage(page)">
                  Supprimer
                </button>
              </div>
            </div>
            <p v-if="editingPageId !== page.id" class="mt-2 text-sm break-words whitespace-pre-wrap" data-testid="page-content">
              {{ page.content }}
            </p>
            <form v-else class="mt-2 grid gap-2" @submit.prevent="savePage(page)">
              <textarea
                v-model="pageDraft"
                name="page-draft"
                rows="4"
                required
                class="min-w-0 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />
              <div class="flex gap-2">
                <button type="submit" class="rounded-md bg-stone-900 px-3 py-1 text-sm text-white hover:bg-stone-700">
                  Enregistrer
                </button>
                <button
                  type="button"
                  class="rounded-md border border-stone-300 px-3 py-1 text-sm hover:bg-stone-100"
                  @click="editingPageId = null"
                >
                  Annuler
                </button>
              </div>
            </form>
          </li>
        </ol>

        <form class="mt-4 grid gap-2 rounded-lg border border-stone-200 bg-white p-4" @submit.prevent="addPage">
          <label class="grid gap-1 text-sm">
            <span class="font-medium">Nouvelle page</span>
            <textarea
              v-model="newPage"
              name="new-page"
              rows="4"
              required
              maxlength="5000"
              class="min-w-0 rounded-md border border-stone-300 px-3 py-2 focus:border-stone-500 focus:outline-none"
            />
          </label>
          <div>
            <button
              type="submit"
              :disabled="pending"
              class="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
            >
              Ajouter la page
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>
