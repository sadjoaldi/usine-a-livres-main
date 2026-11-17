import type { UserRecord } from "../schemas/user.schema";
import type { JsonFile } from "./json-file";
import type { UserRepository } from "./user.repository";

/**
 * Bonus : les livres dans data/books.json, gardés d'un redémarrage à l'autre.
 * Même contrat que InMemoryBookRepository : le reste de l'application ne voit pas la différence.
 * Lire le fichier une fois à la construction, le réécrire après chaque create, update, delete.
 * Id neuf : le plus grand id existant plus un (un redémarrage ne doit pas repartir à 1).
 */
export class JsonFileUserRepository implements UserRepository {
  // À faire : injecter le JsonFile<UserRecord>. Le repository ne le crée pas : container.ts le lui passe.
  private user: UserRecord[] = [];

  constructor(readonly jsonFile: JsonFile<UserRecord>) {
    this.user = this.jsonFile.read();
  }
  findByEmail(email: string): UserRecord | undefined {
    const userEmail = this.user.find(
      (us) => us.email.toLowerCase().trim() === email.toLowerCase().trim(),
    );
    return userEmail;
  }

  findAll(): UserRecord[] {
    return this.user;
  }

  findById(id: number): UserRecord | undefined {
    const userID = this.user.find((us) => us.id === id);
    return userID;
  }

  create(data: Omit<UserRecord, "id">): UserRecord {
    const nextID =
      this.user.length === 0
        ? 1
        : Math.max(...this.user.map((us) => us.id)) + 1;

    const newUser = {
      id: nextID,
      ...data,
    };

    this.user.push(newUser);
    this.jsonFile.write(this.user);

    return newUser;
  }
}
