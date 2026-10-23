import type { Book, BookWithPages } from "../domain/book";
import type { Clock } from "../domain/clock";
import { ConflictError, NotFoundError } from "../errors/domain.error";
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
    const books = this.bookRepository.findAll();

    const parseBook = books.map((book) => {
      const pages = this.pageRepository.findByBookId(book.id);
      return { ...book, pageCount: pages.length };
    });
    return parseBook;
  }

  /** Le livre et ses pages triées. Lever une NotFoundError si le livre n'existe pas. */
  getById(id: number): BookWithPages {
    const findBook = this.bookRepository.findById(id);
    if (!findBook) {
      throw new NotFoundError(`Le livre ${id} n'existe pas`);
    }
    const pages = this.pageRepository.findByBookId(id);
    const sortedPages = [...pages].sort((a, b) => a.number - b.number);

    return { ...findBook, pageCount: pages.length, pages: sortedPages };
  }

  /**
   * Créer le livre, `createdAt` donné par l'horloge en ISO (`toISOString()`), `pageCount` à 0.
   * Lever une ConflictError si le même auteur a déjà un livre du même titre (casse et espaces ignorés).
   */
  create(input: BookInput): Book {
    const authorBooks = this.bookRepository
      .findAll()
      .find(
        (book) =>
          book.title.trim().toLowerCase() ===
            input.title.trim().toLowerCase() &&
          book.author.trim().toLowerCase() ===
            input.author.trim().toLowerCase(),
      );
    if (authorBooks) {
      throw new ConflictError(
        `Le livre "${input.title}" de l'auteur "${input.author}" existe déjà`,
      );
    }

    const createdAt = this.clock.now().toISOString();
    const newBook = this.bookRepository.create({ ...input, createdAt });
    return { ...newBook, pageCount: 0 };
  }

  /**
   * Remplacer titre, auteur et genre ; `createdAt` ne change pas.
   * NotFoundError si le livre n'existe pas ; ConflictError en cas de doublon avec un AUTRE livre.
   */
  update(id: number, input: BookInput): Book {
    const findBook = this.bookRepository.findById(id);
    if (!findBook) {
      throw new NotFoundError(`Le livre ${id} n'existe pas`);
    }
    const authorBooks = this.bookRepository
      .findAll()
      .find(
        (book) =>
          book.id !== id &&
          book.title.trim().toLowerCase() ===
            input.title.trim().toLowerCase() &&
          book.author.trim().toLowerCase() ===
            input.author.trim().toLowerCase(),
      );
    if (authorBooks) {
      throw new ConflictError(
        `Le livre "${input.title}" de l'auteur "${input.author}" existe déjà`,
      );
    }

    const updatedBook = this.bookRepository.update(id, input);
    const pagesNumber = this.pageRepository.findByBookId(id).length;
    return { ...updatedBook!, pageCount: pagesNumber };
  }

  /** Supprimer le livre et toutes ses pages. NotFoundError si le livre n'existe pas. */
  delete(id: number): void {
    const findBook = this.bookRepository.findById(id);
    if (!findBook) {
      throw new NotFoundError(`Le livre ${id} n'existe pas`);
    }
    this.pageRepository.deleteByBookId(id);
    this.bookRepository.delete(id);
  }
}
