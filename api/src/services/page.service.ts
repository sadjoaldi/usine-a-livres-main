import type { Page } from "../domain/page";
import type { BookRepository } from "../repositories/book.repository";
import type { PageRepository } from "../repositories/page.repository";
import type { PageInput } from "../schemas/page.schema";

/** Les règles des pages : le livre doit exister, les numéros suivent 1, 2, 3… sans trou, un plafond de pages. */
export class PageService {
  // À faire : injecter par le constructeur
  //   - le PageRepository ;
  //   - le BookRepository : vérifier que le livre existe ;
  //   - le plafond de pages par livre (un `number`) : une valeur de configuration s'injecte comme un objet.
  //     Les tests passent un plafond de 5 au container : il doit arriver jusqu'ici.
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
    throw new Error("À faire");
  }

  /**
   * Changer le contenu ; le numéro ne bouge pas.
   * NotFoundError si le livre n'existe pas, si la page n'existe pas, ou si elle appartient à un autre livre :
   * PUT /books/1/pages/7 ne touche jamais une page du livre 2.
   */
  update(bookId: number, pageId: number, input: PageInput): Page {
    throw new Error("À faire");
  }

  /**
   * Supprimer la page, puis décaler d'un cran le numéro de chaque page qui la suivait : 1, 2, 3 moins la 2 donne 1, 2.
   * Mêmes NotFoundError que update.
   */
  delete(bookId: number, pageId: number): void {
    throw new Error("À faire");
  }
}
