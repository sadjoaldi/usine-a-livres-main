import type { NewPage, Page } from "../domain/page"

/** Le contrat d'accès aux pages. Aucune règle métier ici : la numérotation est le travail du service. */
export interface PageRepository {
  /** Les pages d'un livre, triées par numéro croissant. */
  findByBookId(bookId: number): Page[]
  findById(id: number): Page | undefined
  /** Attribue l'id et renvoie la page rangée. */
  create(data: NewPage): Page
  /** `undefined` si la page n'existe pas. */
  update(id: number, changes: Partial<Pick<Page, "number" | "content">>): Page | undefined
  /** `false` si la page n'existait pas. */
  delete(id: number): boolean
  /** Supprime toutes les pages d'un livre. */
  deleteByBookId(bookId: number): void
}
