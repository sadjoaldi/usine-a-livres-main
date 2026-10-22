// Les types de l'API, recopiés côté front : avec Fastify, rien ne les partage automatiquement.

export const GENRES = ["roman", "essai", "bd", "poesie", "jeunesse"] as const
export type Genre = (typeof GENRES)[number]

export const GENRE_LABELS: Record<Genre, string> = {
  roman: "Roman",
  essai: "Essai",
  bd: "BD",
  poesie: "Poésie",
  jeunesse: "Jeunesse",
}

export type Book = {
  id: number
  title: string
  author: string
  genre: Genre
  createdAt: string
  pageCount: number
}

export type Page = {
  id: number
  bookId: number
  number: number
  content: string
}

export type BookWithPages = Book & { pages: Page[] }

export type BookInput = Pick<Book, "title" | "author" | "genre">
