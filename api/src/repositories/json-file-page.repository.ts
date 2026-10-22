import type { NewPage, Page } from "../domain/page";
import type { JsonFile } from "./json-file";
import type { PageRepository } from "./page.repository";

/** Bonus : les pages dans data/pages.json. Même principe que JsonFileBookRepository. */
export class JsonFilePageRepository implements PageRepository {
  // À faire : injecter le JsonFile<Page>.
  private pages: Page[] = [];
  constructor(readonly jsonFile: JsonFile<Page>) {
    this.pages = this.jsonFile.read();
  }

  findByBookId(bookId: number): Page[] {
    return this.pages.filter((pg) => pg.bookId === bookId);
  }

  findById(id: number): Page | undefined {
    return this.pages.find((pg) => pg.id === id);
  }

  create(data: NewPage): Page {
    const nextID =
      this.pages.length === 0
        ? 1
        : Math.max(...this.pages.map((pg) => pg.id)) + 1;

    const newPage: Page = {
      id: nextID,
      ...data,
    };

    this.pages.push(newPage);
    this.jsonFile.write(this.pages);

    return newPage;
  }

  update(
    id: number,
    changes: Partial<Pick<Page, "number" | "content">>,
  ): Page | undefined {
    const pageToUpdate = this.findById(id);
    if (!pageToUpdate) {
      return undefined;
    }

    Object.assign(pageToUpdate, changes);
    this.jsonFile.write(this.pages);

    return pageToUpdate;
  }

  delete(id: number): boolean {
    const pageToDelete = this.findById(id);
    if (!pageToDelete) {
      return false;
    }
    this.pages = this.pages.filter((pg) => pg.id !== id);
    this.jsonFile.write(this.pages);
    return true;
  }

  deleteByBookId(bookId: number): void {
    this.pages = this.pages.filter((pg) => pg.bookId !== bookId);
    this.jsonFile.write(this.pages);
  }
}
