import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { addPage, createBook, makeApp } from "./helpers"

// Bonus : le stockage en fichiers JSON. Chaque test travaille dans un dossier temporaire.
describe("bonus : stockage JSON", () => {
  const dirs: string[] = []
  const tempDir = () => {
    const dir = mkdtempSync(join(tmpdir(), "usine-a-livres-"))
    dirs.push(dir)
    return dir
  }
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  it("garde livres et pages d'une application à la suivante (comme un redémarrage)", async () => {
    const dataDir = tempDir()
    const before = makeApp({ storage: "json", dataDir })
    const bookId = await createBook(before)
    await addPage(before, bookId, "un")
    await addPage(before, bookId, "deux")
    await before.close()

    const after = makeApp({ storage: "json", dataDir })
    const book = (await after.inject({ method: "GET", url: `/books/${bookId}` })).json()
    expect(book).toMatchObject({ title: "Dune", pageCount: 2 })
    expect(book.pages.map((page: { number: number }) => page.number)).toEqual([1, 2])
  })

  it("écrit data/books.json et data/pages.json, et retire du fichier les pages d'un livre supprimé", async () => {
    const dataDir = tempDir()
    const app = makeApp({ storage: "json", dataDir })
    const bookId = await createBook(app)
    await addPage(app, bookId, "un")
    expect(JSON.parse(readFileSync(join(dataDir, "books.json"), "utf8"))).toHaveLength(1)
    await app.inject({ method: "DELETE", url: `/books/${bookId}` })
    expect(JSON.parse(readFileSync(join(dataDir, "pages.json"), "utf8"))).toEqual([])
  })

  it("continue la numérotation des id après un redémarrage", async () => {
    const dataDir = tempDir()
    const first = await createBook(makeApp({ storage: "json", dataDir }))
    const second = await createBook(makeApp({ storage: "json", dataDir }), {
      title: "Persepolis",
      author: "Marjane Satrapi",
      genre: "bd",
    })
    expect(second).toBe(first + 1)
  })
})
