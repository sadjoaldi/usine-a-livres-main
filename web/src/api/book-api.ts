import type { Book, BookInput, BookWithPages, Page } from "../types"

/** Une réponse d'erreur de l'API, ou l'API injoignable (`status` à 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** La requête qui a échoué, par exemple `DELETE /books/3`. */
    readonly route: string,
    /** La route n'existe pas encore côté API, ou sa méthode lève encore « À faire ». */
    readonly notImplemented: boolean,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE"

/** Le client HTTP de l'API, créé une fois dans `main.ts` et fourni aux composants par `provide`. */
export class BookApi {
  constructor(private readonly baseUrl: string) {}

  listBooks(): Promise<Book[]> {
    return this.json("GET", "/books")
  }

  getBook(id: number): Promise<BookWithPages> {
    return this.json("GET", `/books/${id}`)
  }

  createBook(input: BookInput): Promise<Book> {
    return this.json("POST", "/books", input)
  }

  updateBook(id: number, input: BookInput): Promise<Book> {
    return this.json("PUT", `/books/${id}`, input)
  }

  async deleteBook(id: number): Promise<void> {
    await this.send("DELETE", `/books/${id}`)
  }

  addPage(bookId: number, content: string): Promise<Page> {
    return this.json("POST", `/books/${bookId}/pages`, { content })
  }

  updatePage(bookId: number, pageId: number, content: string): Promise<Page> {
    return this.json("PUT", `/books/${bookId}/pages/${pageId}`, { content })
  }

  async deletePage(bookId: number, pageId: number): Promise<void> {
    await this.send("DELETE", `/books/${bookId}/pages/${pageId}`)
  }

  /**
   * Le body JSON d'une réponse réussie. Sa forme n'est vérifiée par personne : `response.json()` est un `any`,
   * c'est la limite d'une API REST sans contrat partagé (voir le chapitre tRPC).
   */
  private async json<T>(method: Method, path: string, body?: object): Promise<T> {
    const response = await this.send(method, path, body)
    return response.json()
  }

  private async send(method: Method, path: string, body?: object): Promise<Response> {
    let response: Response
    try {
      // Pas de Content-Type sans body : Fastify refuse un DELETE « JSON » vide.
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch {
      throw new ApiError(0, `API injoignable sur ${this.baseUrl} : lancer npm run dev à la racine du projet`, `${method} ${path}`, false)
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null)
      throw toApiError(response.status, `${method} ${path}`, payload)
    }
    return response
  }
}

function toApiError(status: number, route: string, payload: unknown): ApiError {
  const error = field(payload, "error")
  const message = field(payload, "message") ?? `Erreur ${status}`
  if (error === "RouteNotFound" || status === 501 || message === "À faire") {
    return new ApiError(status, "Route non implémentée côté API", route, true)
  }
  return new ApiError(status, message, route, false)
}

function field(payload: unknown, key: string): string | undefined {
  if (typeof payload !== "object" || payload === null || !(key in payload)) return undefined
  const value: unknown = Reflect.get(payload, key)
  return typeof value === "string" ? value : undefined
}
