import type { BookFields, BookRecord } from "../domain/book"

/**
 * Le contrat d'accès aux livres. Les services dépendent de cette interface, jamais d'une classe :
 * on change de stockage (mémoire, fichier JSON, base de données) sans toucher aux services.
 */
export interface BookRepository {
  findAll(): BookRecord[]
  findById(id: number): BookRecord | undefined
  /** Attribue l'id et renvoie le livre rangé. */
  create(data: Omit<BookRecord, "id">): BookRecord
  /** `undefined` si le livre n'existe pas. */
  update(id: number, fields: BookFields): BookRecord | undefined
  /** `false` si le livre n'existait pas. */
  delete(id: number): boolean
}
