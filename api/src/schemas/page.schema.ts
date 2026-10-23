import { z } from "zod";
import { idParam } from "./id.schema";

// À faire : le body de POST /books/:id/pages et de PUT /books/:id/pages/:pageId.
//   content : texte, trim, 1 à 5 000 caractères, message en français.
// Le numéro de page n'en fait PAS partie : c'est le service qui l'attribue. Un `number` envoyé par le client est ignoré.
export const pageInputSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "le contenu est requis")
    .max(5000, "le contenu est trop long"),
});
export type PageInput = z.infer<typeof pageInputSchema>;

// À faire : les params de /books/:id/pages (un id), sur le modèle de bookIdParamsSchema.
export const bookPagesParamsSchema = z.object({
  id: idParam,
});

// À faire : les params de /books/:id/pages/:pageId (deux id).
export const pageParamsSchema = z.object({
  id: idParam,
  pageId: idParam,
});

// Bonus JSON : une page relue depuis data/pages.json (id, bookId, number, content).
export const pageRecordSchema = z.object({
  id: z.number(),
  bookId: z.number(),
  number: z.number(),
  content: z
    .string()
    .trim()
    .min(1, "le contenu est requis")
    .max(5000, "le contenu est trop long"),
});
