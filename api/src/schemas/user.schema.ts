import z from "zod";

export const userInputSchema = z.object({
  email: z.string().trim().email("Email non valide ou format erroné"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export type UserInput = z.infer<typeof userInputSchema>;

export const userRecordSchema = z.object({
  id: z.number(),
  email: z.string().trim(),
  password: z.string(),
});

export type UserRecord = z.infer<typeof userRecordSchema>;
