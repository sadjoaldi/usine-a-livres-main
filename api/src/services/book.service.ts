import type { Book, BookWithPages } from "../domain/book";
import type { Clock } from "../domain/clock";
import type { BookRepository } from "../repositories/book.repository";
import type { PageRepository } from "../repositories/page.repository";
import type { BookInput } from "../schemas/book.schema";

/** Les règles des livres. Le cœur du métier : aucune trace de HTTP ici (ni `reply`, ni statut). */
export class BookService {
  // À faire : injecter par le constructeur
  //   - le BookRepository : lire et écrire les livres ;
  //   - le PageRepository : compter les pages, supprimer celles d'un livre supprimé ;
  //   - la Clock : l'heure de createdAt. Jamais `new Date()` ici, sinon un test ne peut pas fixer la date.
  // Typer chaque paramètre par l'interface (BookRepository), jamais par une classe (InMemoryBookRepository).
  // Le service ne crée aucune de ses dépendances : c'est le rôle de container.ts.
  constructor(
    readonly bookRepository: BookRepository,
    readonly pageRepository: PageRepository,
    readonly clock: Clock,
  ) {}

  /** Tous les livres, chacun avec son `pageCount` (calculé à la lecture, jamais stocké). */
  list(): Book[] {
    throw new Error("À faire");
  }

  /** Le livre et ses pages triées. Lever une NotFoundError si le livre n'existe pas. */
  getById(id: number): BookWithPages {
    throw new Error("À faire");
  }

  /**
   * Créer le livre, `createdAt` donné par l'horloge en ISO (`toISOString()`), `pageCount` à 0.
   * Lever une ConflictError si le même auteur a déjà un livre du même titre (casse et espaces ignorés).
   */
  create(input: BookInput): Book {
    throw new Error("À faire");
  }

  /**
   * Remplacer titre, auteur et genre ; `createdAt` ne change pas.
   * NotFoundError si le livre n'existe pas ; ConflictError en cas de doublon avec un AUTRE livre.
   */
  update(id: number, input: BookInput): Book {
    throw new Error("À faire");
  }

  /** Supprimer le livre et toutes ses pages. NotFoundError si le livre n'existe pas. */
  delete(id: number): void {
    throw new Error("À faire");
  }
}
