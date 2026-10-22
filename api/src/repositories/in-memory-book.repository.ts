import type { BookFields, BookRecord } from "../domain/book"
import type { BookRepository } from "./book.repository"

/**
 * Les livres en mémoire, perdus à l'arrêt du serveur.
 * Choisir le rangement interne (un tableau ou une `Map`, en `private`) et un compteur pour les id.
 * Aucune règle métier ici : pas de doublon à vérifier, pas d'erreur à lever. Un livre absent, c'est `undefined`.
 */
export class InMemoryBookRepository implements BookRepository {
  findAll(): BookRecord[] {
    throw new Error("À faire")
  }

  findById(id: number): BookRecord | undefined {
    throw new Error("À faire")
  }

  /** Attribuer un id neuf (1, 2, 3…), ranger le livre, le renvoyer. */
  create(data: Omit<BookRecord, "id">): BookRecord {
    throw new Error("À faire")
  }

  /** Remplacer les champs du livre ; `undefined` s'il n'existe pas. */
  update(id: number, fields: BookFields): BookRecord | undefined {
    throw new Error("À faire")
  }

  /** `true` si le livre existait. */
  delete(id: number): boolean {
    throw new Error("À faire")
  }
}
