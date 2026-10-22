import { describe, expect, it } from "vitest"
import { makeApp } from "./helpers"

describe("erreurs du transport", () => {
  it("une route inconnue : 404 RouteNotFound", async () => {
    const response = await makeApp().inject({ method: "GET", url: "/auteurs" })
    expect(response.statusCode).toBe(404)
    expect(response.json()).toMatchObject({ error: "RouteNotFound" })
  })

  it("un JSON mal formé : 400", async () => {
    const response = await makeApp().inject({
      method: "POST",
      url: "/books",
      headers: { "content-type": "application/json" },
      payload: "{ pas du json",
    })
    expect(response.statusCode).toBe(400)
  })

  it("une erreur imprévue ne laisse fuir aucun détail : 500 générique", async () => {
    const response = await makeApp({ clock: { now: () => { throw new Error("horloge en panne") } } }).inject({
      method: "POST",
      url: "/books",
      payload: { title: "Dune", author: "Frank Herbert", genre: "roman" },
    })
    expect(response.statusCode).toBe(500)
    expect(response.body).not.toContain("horloge en panne")
  })
})

describe("CORS", () => {
  it("autorise le front sur http://localhost:5173", async () => {
    const response = await makeApp().inject({
      method: "OPTIONS",
      url: "/books",
      headers: { origin: "http://localhost:5173", "access-control-request-method": "DELETE" },
    })
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173")
    expect(String(response.headers["access-control-allow-methods"])).toContain("DELETE")
  })
})
