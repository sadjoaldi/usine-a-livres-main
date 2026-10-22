import type { Page } from "./page"

/** Les genres acceptés, dans l'ordre d'affichage. */
export const GENRES = ["roman", "essai", "bd", "poesie", "jeunesse"] as const
export type Genre = (typeof GENRES)[number]

/** Un livre tel qu'un repository le range : sans ses pages. */
export type BookRecord = {
  id: number
  title: string
  author: string
  genre: Genre
  /** Date de création, ISO 8601 en UTC. */
  createdAt: string
}

/** Les champs que le client choisit, à la création comme à la modification. */
export type BookFields = Pick<BookRecord, "title" | "author" | "genre">

/** Un livre tel que l'API le renvoie : `pageCount` est calculé, jamais stocké. */
export type Book = BookRecord & { pageCount: number }

/** La fiche d'un livre : le livre et ses pages, triées par numéro. */
export type BookWithPages = Book & { pages: Page[] }
