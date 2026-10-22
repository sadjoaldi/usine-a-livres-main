import { z } from "zod"

const message = "L'id doit être un entier positif"

/** Un id lu dans l'URL : il arrive en texte, `coerce` le convertit en nombre avant de le vérifier. */
export const idParam = z.coerce.number(message).int(message).positive(message)
