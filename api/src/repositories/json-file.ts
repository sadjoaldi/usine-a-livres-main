import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { z } from "zod";

/**
 * Bonus : un tableau rangé dans un fichier JSON. Les deux repositories JSON en reçoivent chacun un.
 * Outils : `existsSync`, `readFileSync`, `writeFileSync`, `mkdirSync` (node:fs) et `dirname` (node:path).
 */
export class JsonFile<T> {
  // À faire : recevoir par le constructeur le chemin du fichier et le schema Zod d'un élément (z.ZodType<T>).
  constructor(
    readonly path: string,
    readonly schema: z.ZodType<T>,
  ) {}

  /**
   * Le contenu du fichier, ou `[]` s'il n'existe pas encore.
   * Passer le texte lu par JSON.parse, puis par `z.array(schema).parse(...)` : pas de `as T[]`.
   */
  read(): T[] {
    if (!existsSync(this.path)) {
      return [];
    }

    const parsing = JSON.parse(readFileSync(this.path, "utf-8"));

    return z.array(this.schema).parse(parsing);
  }

  /** Réécrire tout le fichier (JSON indenté) ; créer le dossier s'il manque. */
  write(items: readonly T[]): void {
    const doc = dirname(this.path);
    mkdirSync(doc, { recursive: true });
    const text = JSON.stringify(items, null, 2);

    writeFileSync(this.path, text);
    return;
  }
}
