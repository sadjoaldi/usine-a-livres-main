import { describe, expect, it } from "vitest"
import { createBook, dune, makeApp, NOW } from "./helpers"

describe("GET /books", () => {
  it("renvoie 200 et une liste vide au démarrage", async () => {
    const response = await makeApp().inject({ method: "GET", url: "/books" })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual([])
  })

  it("renvoie les livres créés, chacun avec son pageCount", async () => {
    const app = makeApp()
    await createBook(app)
    await createBook(app, { title: "Persepolis", author: "Marjane Satrapi", genre: "bd" })
    const books = (await app.inject({ method: "GET", url: "/books" })).json()
    expect(books).toHaveLength(2)
    expect(books[1]).toMatchObject({ title: "Persepolis", genre: "bd", pageCount: 0 })
  })
})

describe("POST /books", () => {
  it("crée un livre : 201, id attribué, createdAt donné par l'horloge, pageCount à 0", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books", payload: dune })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({ id: 1, ...dune, createdAt: NOW, pageCount: 0 })
  })

  it("attribue des id différents à deux livres", async () => {
    const app = makeApp()
    const first = await createBook(app)
    const second = await createBook(app, { title: "Les Misérables", author: "Victor Hugo", genre: "roman" })
    expect(second).not.toBe(first)
  })

  it("refuse un titre vide : 400", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books", payload: { ...dune, title: "  " } })
    expect(response.statusCode).toBe(400)
  })

  it("refuse un auteur absent : 400", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books", payload: { title: "Dune", genre: "roman" } })
    expect(response.statusCode).toBe(400)
  })

  it("refuse un genre hors liste : 400", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books", payload: { ...dune, genre: "polar" } })
    expect(response.statusCode).toBe(400)
  })

  it("renvoie un body d'erreur { error, message } lisible", async () => {
    const response = await makeApp().inject({ method: "POST", url: "/books", payload: { ...dune, genre: "polar" } })
    expect(response.json()).toMatchObject({ error: "ValidationError", message: expect.any(String) })
  })

  it("refuse un doublon (même titre, même auteur, casse ignorée) : 409", async () => {
    const app = makeApp()
    await createBook(app)
    const response = await app.inject({ method: "POST", url: "/books", payload: { ...dune, title: "DUNE" } })
    expect(response.statusCode).toBe(409)
  })
})

describe("GET /books/:id", () => {
  it("renvoie le livre et ses pages (vides) : 200", async () => {
    const app = makeApp()
    const id = await createBook(app)
    const response = await app.inject({ method: "GET", url: `/books/${id}` })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id, ...dune, createdAt: NOW, pageCount: 0, pages: [] })
  })

  it("renvoie 404 pour un livre inconnu", async () => {
    const response = await makeApp().inject({ method: "GET", url: "/books/999" })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("renvoie 400 pour un id qui n'est pas un entier positif", async () => {
    const response = await makeApp().inject({ method: "GET", url: "/books/abc" })
    expect(response.statusCode).toBe(400)
  })
})

describe("PUT /books/:id", () => {
  it("modifie le livre : 200, createdAt inchangé", async () => {
    const app = makeApp()
    const id = await createBook(app)
    const changes = { title: "Dune, tome 1", author: "Frank Herbert", genre: "roman" }
    const response = await app.inject({ method: "PUT", url: `/books/${id}`, payload: changes })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ id, ...changes, createdAt: NOW, pageCount: 0 })
    expect((await app.inject({ method: "GET", url: `/books/${id}` })).json()).toMatchObject(changes)
  })

  it("renvoie 404 pour un livre inconnu", async () => {
    const response = await makeApp().inject({ method: "PUT", url: "/books/999", payload: dune })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("refuse un body invalide : 400", async () => {
    const app = makeApp()
    const id = await createBook(app)
    const response = await app.inject({ method: "PUT", url: `/books/${id}`, payload: { title: "Dune" } })
    expect(response.statusCode).toBe(400)
  })

  it("accepte de renvoyer le livre tel quel (pas de doublon avec lui-même)", async () => {
    const app = makeApp()
    const id = await createBook(app)
    const response = await app.inject({ method: "PUT", url: `/books/${id}`, payload: dune })
    expect(response.statusCode).toBe(200)
  })
})

describe("DELETE /books/:id", () => {
  it("supprime le livre : 204 sans body, puis 404 à la lecture", async () => {
    const app = makeApp()
    const id = await createBook(app)
    const response = await app.inject({ method: "DELETE", url: `/books/${id}` })
    expect(response.statusCode).toBe(204)
    expect(response.body).toBe("")
    const after = await app.inject({ method: "GET", url: `/books/${id}` })
    expect(after.statusCode).toBe(404)
    expect(after.json()).toMatchObject({ error: "NotFoundError" })
  })

  it("renvoie 404 pour un livre inconnu", async () => {
    const response = await makeApp().inject({ method: "DELETE", url: "/books/999" })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "NotFoundError" })
  })
})
