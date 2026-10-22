/** Une page d'un livre. `number` commence à 1 et ne laisse aucun trou. */
export type Page = {
  id: number
  bookId: number
  number: number
  content: string
}

/** Ce qu'un repository reçoit pour créer une page : tout sauf l'id, qu'il attribue. */
export type NewPage = Omit<Page, "id">
