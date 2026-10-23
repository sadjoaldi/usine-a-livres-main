import type { BookFields, BookRecord } from "../domain/book";
import type { BookRepository } from "./book.repository";

/**
 * Les livres en mémoire, perdus à l'arrêt du serveur.
 * Choisir le rangement interne (un tableau ou une `Map`, en `private`) et un compteur pour les id.
 * Aucune règle métier ici : pas de doublon à vérifier, pas d'erreur à lever. Un livre absent, c'est `undefined`.
 */
export class InMemoryBookRepository implements BookRepository {
  private books: BookRecord[] = [];

  findAll(): BookRecord[] {
    return this.books;
  }

  findById(id: number): BookRecord | undefined {
    return this.books.find((book) => book.id === id);
  }

  /** Attribuer un id neuf (1, 2, 3…), ranger le livre, le renvoyer. */
  create(data: Omit<BookRecord, "id">): BookRecord {
    const nextId =
      this.books.reduce((max, book) => Math.max(max, book.id), 0) + 1;
    const newBook: BookRecord = { id: nextId, ...data };
    this.books.push(newBook);
    return newBook;
  }

  /** Remplacer les champs du livre ; `undefined` s'il n'existe pas. */
  update(id: number, fields: BookFields): BookRecord | undefined {
    const book = this.findById(id);
    if (!book) return undefined;

    Object.assign(book, fields);
    return book;
  }

  /** `true` si le livre existait. */
  delete(id: number): boolean {
    const index = this.books.findIndex((book) => book.id === id);
    if (index === -1) return false;

    this.books.splice(index, 1);
    return true;
  }
}
