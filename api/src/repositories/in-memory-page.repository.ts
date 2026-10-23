import type { NewPage, Page } from "../domain/page";
import type { PageRepository } from "./page.repository";

/**
 * Les pages en mémoire, perdues à l'arrêt du serveur. Même principe que InMemoryBookRepository.
 * Le repository range ce qu'on lui donne : il ne calcule pas les numéros de page, c'est le travail du service.
 */
export class InMemoryPageRepository implements PageRepository {
  private pages: Page[] = [];

  /** Les pages du livre, triées par numéro croissant. */
  findByBookId(bookId: number): Page[] {
    return this.pages
      .filter((page) => page.bookId === bookId)
      .sort((a, b) => a.number - b.number);
  }

  findById(id: number): Page | undefined {
    return this.pages.find((page) => page.id === id);
  }

  /** Attribuer un id neuf, ranger la page, la renvoyer. */
  create(data: NewPage): Page {
    const nextId =
      this.pages.reduce((max, page) => Math.max(max, page.id), 0) + 1;
    const newPage: Page = { id: nextId, ...data };
    this.pages.push(newPage);
    return newPage;
  }

  /** Changer le numéro et/ou le contenu ; `undefined` si la page n'existe pas. */
  update(
    id: number,
    changes: Partial<Pick<Page, "number" | "content">>,
  ): Page | undefined {
    const page = this.findById(id);
    if (!page) return undefined;

    Object.assign(page, changes);
    return page;
  }

  delete(id: number): boolean {
    const index = this.pages.findIndex((page) => page.id === id);
    if (index === -1) return false;

    this.pages.splice(index, 1);
    return true;
  }

  deleteByBookId(bookId: number): void {
    this.pages = this.pages.filter((page) => page.bookId !== bookId);
  }
}
