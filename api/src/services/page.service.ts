import type { Page } from "../domain/page";
import { NotFoundError, ValidationError } from "../errors/domain.error";
import type { BookRepository } from "../repositories/book.repository";
import type { PageRepository } from "../repositories/page.repository";
import type { PageInput } from "../schemas/page.schema";

/** Les règles des pages : le livre doit exister, les numéros suivent 1, 2, 3… sans trou, un plafond de pages. */
export class PageService {
  constructor(
    readonly pageRepository: PageRepository,
    readonly bookRepository: BookRepository,
    readonly maxPagesPerBook: number,
  ) {}

  /**
   * Ajouter une page à la fin du livre : son numéro vaut le nombre de pages actuel plus un.
   * NotFoundError si le livre n'existe pas ; ValidationError si le livre a déjà atteint le plafond.
   */
  add(bookId: number, input: PageInput): Page {
    // 1. Vérifier si le livre existe
    const book = this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(`Le livre ${bookId} n'existe pas`);
    }

    // 2. Vérifier si le plafond de pages est atteint
    const currentPages = this.pageRepository.findByBookId(bookId);
    if (currentPages.length >= this.maxPagesPerBook) {
      throw new ValidationError(
        `Le livre a déjà atteint le plafond de ${this.maxPagesPerBook} pages`,
      );
    }

    // 3. Calculer le numéro de la nouvelle page (nombre actuel + 1)
    const nextPageNumber = currentPages.length + 1;

    // 4. Créer la page en fusionnant l'ID du livre, le numéro calculé et le contenu utilisateur
    const newPage = this.pageRepository.create({
      bookId,
      number: nextPageNumber,
      content: input.content,
    });

    return newPage;
  }

  /**
   * Changer le contenu ; le numéro ne bouge pas.
   * NotFoundError si le livre n'existe pas, si la page n'existe pas, ou si elle appartient à un autre livre.
   */
  update(bookId: number, pageId: number, input: PageInput): Page {
    // 1. Vérifier si le livre existe
    const book = this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(`Le livre ${bookId} n'existe pas`);
    }

    // 2. Vérifier si la page existe
    const page = this.pageRepository.findById(pageId);
    if (!page) {
      throw new NotFoundError(`La page ${pageId} n'existe pas`);
    }

    // 3. Sécurité métier : Vérifier que la page appartient bien à CE livre précis
    if (page.bookId !== bookId) {
      throw new NotFoundError(
        `La page ${pageId} n'appartient pas au livre ${bookId}`,
      );
    }

    // 4. Mettre à jour uniquement le contenu
    const updatedPage = this.pageRepository.update(pageId, {
      content: input.content,
    });

    return updatedPage!;
  }

  /**
   * Supprimer la page, puis décaler d'un cran le numéro de chaque page qui la suivait.
   * Mêmes NotFoundError que update.
   */
  delete(bookId: number, pageId: number): void {
    // 1. Vérifications d'usage (Livre, Page et correspondance)
    const book = this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotFoundError(`Le livre ${bookId} n'existe pas`);
    }

    const pageToDelete = this.pageRepository.findById(pageId);
    if (!pageToDelete) {
      throw new NotFoundError(`La page ${pageId} n'existe pas`);
    }

    if (pageToDelete.bookId !== bookId) {
      throw new NotFoundError(
        `La page ${pageId} n'appartient pas au livre ${bookId}`,
      );
    }

    // On mémorise le numéro de la page qu'on va supprimer pour le décalage
    const deletedPageNumber = pageToDelete.number;

    // 2. Supprimer physiquement la page du dépôt
    this.pageRepository.delete(pageId);

    // 3. Algorithme de réindexation : Boucher le trou !
    // On récupère toutes les pages restantes de ce livre
    const remainingPages = this.pageRepository.findByBookId(bookId);

    // On parcourt les pages et on recule d'un numéro uniquement celles qui étaient APRÈS la page supprimée
    for (const page of remainingPages) {
      if (page.number > deletedPageNumber) {
        this.pageRepository.update(page.id, {
          number: page.number - 1,
        });
      }
    }
  }
}
