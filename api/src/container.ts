import { fileURLToPath } from "node:url";
import type { BookRecord } from "./domain/book";
import type { Clock } from "./domain/clock";
import type { Page } from "./domain/page";
import type { BookRepository } from "./repositories/book.repository";
import { InMemoryBookRepository } from "./repositories/in-memory-book.repository";
import { InMemoryPageRepository } from "./repositories/in-memory-page.repository";
import { JsonFile } from "./repositories/json-file";
import { JsonFileBookRepository } from "./repositories/json-file-book.repository";
import { JsonFilePageRepository } from "./repositories/json-file-page.repository";
import type { PageRepository } from "./repositories/page.repository";
import { BookRouter } from "./routers/book.router";
import { PageRouter } from "./routers/page.router";
import type { Router } from "./routers/router";
import { bookRecordSchema } from "./schemas/book.schema";
import { pageRecordSchema } from "./schemas/page.schema";
import { BookService } from "./services/book.service";
import { PageService } from "./services/page.service";
import { SystemClock } from "./services/system-clock";

export type Storage = "memory" | "json";

/** LA ligne qui choisit le stockage : "memory" (perdu à l'arrêt) ou "json" (bonus, fichiers dans api/data/). */
const STORAGE: Storage = "memory";

export type ContainerOptions = {
  storage: Storage;
  /** Le dossier des fichiers JSON. */
  dataDir: string;
  clock: Clock;
  maxPagesPerBook: number;
};

const defaults: ContainerOptions = {
  storage: STORAGE,
  dataDir: fileURLToPath(new URL("../data", import.meta.url)),
  clock: new SystemClock(),
  maxPagesPerBook: 1000,
};

/**
 * Le seul endroit qui fait des `new` sur les classes du projet.
 * Les tests le construisent avec leurs options : new Container({ clock: horlogeFixe, maxPagesPerBook: 5 }).
 */
export class Container {
  readonly routers: readonly Router[];

  constructor(options: Partial<ContainerOptions> = {}) {
    const config: ContainerOptions = { ...defaults, ...options };

    // À faire : créer ici chaque objet de l'application, une fois, dans l'ordre des dépendances.
    //   1. Les deux repositories, typés par leur interface (const bookRepository: BookRepository = ...) :
    //      en mémoire si config.storage vaut "memory" ;
    //      bonus : en fichiers JSON s'il vaut "json", `${config.dataDir}/books.json` et `${config.dataDir}/pages.json`,
    //      chacun avec son JsonFile et son schema (bookRecordSchema, pageRecordSchema).
    //   2. Les deux services, avec les repositories, config.clock et config.maxPagesPerBook.
    //   3. Les deux routers, avec leur service.
    // Dès qu'un constructeur réclame une dépendance, TypeScript signale ici le `new` à compléter.

    // 1 les 2 repositories
    let bookRepository: BookRepository;
    let pageRepository: PageRepository;

    switch (config.storage) {
      case "memory":
        bookRepository = new InMemoryBookRepository();
        pageRepository = new InMemoryPageRepository();

        break;

      case "json":
        const bookFile = new JsonFile<BookRecord>(
          `${config.dataDir}/books.json`,
          bookRecordSchema,
        );
        const pageFile = new JsonFile<Page>(
          `${config.dataDir}/pages.json`,
          pageRecordSchema,
        );

        bookRepository = new JsonFileBookRepository(bookFile);
        pageRepository = new JsonFilePageRepository(pageFile);

        break;
    }

    // 2 les 2 services
    const bookService = new BookService(
      bookRepository,
      pageRepository,
      config.clock,
    );
    const pageService = new PageService(
      pageRepository,
      bookRepository,
      config.maxPagesPerBook,
    );

    this.routers = [new BookRouter(bookService), new PageRouter(pageService)];
  }
}
