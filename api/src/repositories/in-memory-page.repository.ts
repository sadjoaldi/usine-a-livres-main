import type { NewPage, Page } from "../domain/page"
import type { PageRepository } from "./page.repository"

/**
 * Les pages en mémoire, perdues à l'arrêt du serveur. Même principe que InMemoryBookRepository.
 * Le repository range ce qu'on lui donne : il ne calcule pas les numéros de page, c'est le travail du service.
 */
export class InMemoryPageRepository implements PageRepository {
  /** Les pages du livre, triées par numéro croissant. */
  findByBookId(bookId: number): Page[] {
    throw new Error("À faire")
  }

  findById(id: number): Page | undefined {
    throw new Error("À faire")
  }

  /** Attribuer un id neuf, ranger la page, la renvoyer. */
  create(data: NewPage): Page {
    throw new Error("À faire")
  }

  /** Changer le numéro et/ou le contenu ; `undefined` si la page n'existe pas. */
  update(id: number, changes: Partial<Pick<Page, "number" | "content">>): Page | undefined {
    throw new Error("À faire")
  }

  delete(id: number): boolean {
    throw new Error("À faire")
  }

  deleteByBookId(bookId: number): void {
    throw new Error("À faire")
  }
}
