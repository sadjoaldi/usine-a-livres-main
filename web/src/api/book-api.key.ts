import { inject, type InjectionKey } from "vue"
import type { BookApi } from "./book-api"

/** La clé typée sous laquelle `main.ts` fournit le client : `inject` renvoie alors un `BookApi`, pas un `unknown`. */
export const bookApiKey: InjectionKey<BookApi> = Symbol("BookApi")

/** Le client fourni par `main.ts`. Lève si personne ne l'a fourni, plutôt que de renvoyer `undefined`. */
export function useBookApi(): BookApi {
  const api = inject(bookApiKey)
  if (!api) throw new Error("BookApi non fourni : appeler app.provide(bookApiKey, …) dans main.ts")
  return api
}
