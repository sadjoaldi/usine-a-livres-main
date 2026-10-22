import { describe, expect, it } from "vitest"
import { addPage, createBook, makeApp } from "./helpers"

describe("POST /books/:id/pages", () => {
  it("ajoute une page : 201, numéro 1 attribué par le service", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "Il était une fois" } })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ bookId, number: 1, content: "Il était une fois" })
  })

  it("numérote les pages à la suite : 1, 2, 3", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    await addPage(app, bookId, "un")
    await addPage(app, bookId, "deux")
    const third = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "trois" } })
    expect(third.json()).toMatchObject({ number: 3 })
  })

  it("ignore un numéro envoyé par le client", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "un", number: 42 } })
    expect(response.json()).toMatchObject({ number: 1 })
  })

  it("met à jour pageCount dans la liste et dans la fiche", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    await addPage(app, bookId, "un")
    await addPage(app, bookId, "deux")
    expect((await app.inject({ method: "GET", url: "/books" })).json()[0]).toMatchObject({ pageCount: 2 })
    const book = (await app.inject({ method: "GET", url: `/books/${bookId}` })).json()
    expect(book.pageCount).toBe(2)
    expect(book.pages.map((page: { content: string }) => page.content)).toEqual(["un", "deux"])
  })

  it("refuse une page vide : 400", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "" } })
    expect(response.statusCode).toBe(400)
  })

  it("renvoie 404 si le livre n'existe pas", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books/999/pages", payload: { content: "un" } })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("refuse une page de trop (plafond passé au container) : 400", async () => {
    const app = makeApp({ maxPagesPerBook: 2 })
    const bookId = await createBook(app)
    await addPage(app, bookId, "un")
    await addPage(app, bookId, "deux")
    const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "trois" } })
    expect(response.statusCode).toBe(400)
    expect(response.json()).toMatchObject({ error: "ValidationError" })
  })
})

describe("PUT /books/:id/pages/:pageId", () => {
  it("modifie le contenu : 200, numéro inchangé", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const pageId = await addPage(app, bookId, "brouillon")
    const response = await app.inject({ method: "PUT", url: `/books/${bookId}/pages/${pageId}`, payload: { content: "propre" } })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id: pageId, bookId, number: 1, content: "propre" })
  })

  it("renvoie 404 pour une page inconnue", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const response = await app.inject({ method: "PUT", url: `/books/${bookId}/pages/999`, payload: { content: "x" } })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("renvoie 404 pour la page d'un autre livre", async () => {
    const app = makeApp()
    const first = await createBook(app)
    const second = await createBook(app, { title: "Persepolis", author: "Marjane Satrapi", genre: "bd" })
    const pageOfFirst = await addPage(app, first, "un")
    const response = await app.inject({ method: "PUT", url: `/books/${second}/pages/${pageOfFirst}`, payload: { content: "x" } })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("refuse un contenu vide : 400", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const pageId = await addPage(app, bookId, "un")
    const response = await app.inject({ method: "PUT", url: `/books/${bookId}/pages/${pageId}`, payload: { content: "" } })
    expect(response.statusCode).toBe(400)
  })
})

describe("DELETE /books/:id/pages/:pageId", () => {
  it("supprime la page : 204, puis renumérote les suivantes sans trou", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    await addPage(app, bookId, "un")
    const middle = await addPage(app, bookId, "deux")
    await addPage(app, bookId, "trois")
    const response = await app.inject({ method: "DELETE", url: `/books/${bookId}/pages/${middle}` })
    expect(response.statusCode).toBe(204)
    const pages = (await app.inject({ method: "GET", url: `/books/${bookId}` })).json().pages
    expect(pages.map((page: { number: number; content: string }) => [page.number, page.content])).toEqual([
      [1, "un"],
      [2, "trois"],
    ])
  })

  it("numérote la page suivante après une suppression : pas de doublon de numéro", async () => {
    const app = makeApp()
    const bookId = await createBook(app)
    const first = await addPage(app, bookId, "un")
    await addPage(app, bookId, "deux")
    await app.inject({ method: "DELETE", url: `/books/${bookId}/pages/${first}` })
    const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content: "trois" } })
    expect(response.json()).toMatchObject({ number: 2 })
  })

  it("renvoie 404 pour une page inconnue ou d'un autre livre", async () => {
    const app = makeApp()
    const first = await createBook(app)
    const second = await createBook(app, { title: "Persepolis", author: "Marjane Satrapi", genre: "bd" })
    const pageOfFirst = await addPage(app, first, "un")
    for (const url of [`/books/${first}/pages/999`, `/books/${second}/pages/${pageOfFirst}`]) {
      const response = await app.inject({ method: "DELETE", url })
      expect(response.statusCode).toBe(404)
      expect(response.json()).toMatchObject({ error: "NotFoundError" })
    }
  })
})

describe("DELETE /books/:id et ses pages", () => {
  it("supprime les pages du livre, pas celles des autres", async () => {
    const app = makeApp()
    const doomed = await createBook(app)
    const kept = await createBook(app, { title: "Persepolis", author: "Marjane Satrapi", genre: "bd" })
    const doomedPage = await addPage(app, doomed, "à jeter")
    await addPage(app, kept, "à garder")
    await app.inject({ method: "DELETE", url: `/books/${doomed}` })
    expect((await app.inject({ method: "GET", url: `/books/${kept}` })).json()).toMatchObject({ pageCount: 1 })
    // La page du livre supprimé ne doit plus exister nulle part : vérifié dans json-file.test.ts (bonus).
    const response = await app.inject({ method: "PUT", url: `/books/${doomed}/pages/${doomedPage}`, payload: { content: "x" } })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })
})
