import type { BookFields, BookRecord } from "../domain/book";
import type { BookRepository } from "./book.repository";
import type { JsonFile } from "./json-file";

/**
 * Bonus : les livres dans data/books.json, gardés d'un redémarrage à l'autre.
 * Même contrat que InMemoryBookRepository : le reste de l'application ne voit pas la différence.
 * Lire le fichier une fois à la construction, le réécrire après chaque create, update, delete.
 * Id neuf : le plus grand id existant plus un (un redémarrage ne doit pas repartir à 1).
 */
export class JsonFileBookRepository implements BookRepository {
  // À faire : injecter le JsonFile<BookRecord>. Le repository ne le crée pas : container.ts le lui passe.
  private books: BookRecord[] = [];

  constructor(readonly jsonFile: JsonFile<BookRecord>) {
    this.books = this.jsonFile.read();
  }

  findAll(): BookRecord[] {
    return this.books;
  }

  findById(id: number): BookRecord | undefined {
    const bookID = this.books.find((bk) => bk.id === id);
    return bookID;
  }

  create(data: Omit<BookRecord, "id">): BookRecord {
    const nextID =
      this.books.length === 0
        ? 1
        : Math.max(...this.books.map((fb) => fb.id)) + 1;

    const newBook = {
      id: nextID,
      ...data,
    };

    this.books.push(newBook);
    this.jsonFile.write(this.books);

    return newBook;
  }

  update(id: number, fields: BookFields): BookRecord | undefined {
    const findBookByID = this.findById(id);
    if (!findBookByID) {
      return undefined;
    }

    Object.assign(findBookByID, fields);
    this.jsonFile.write(this.books);
    return findBookByID;
  }

  delete(id: number): boolean {
    const isExist = this.findById(id);
    if (!isExist) {
      return false;
    }
    this.books = this.books.filter((bk) => bk.id !== id);
    this.jsonFile.write(this.books);

    return true;
  }
}
