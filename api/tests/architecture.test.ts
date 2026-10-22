import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

const src = join(import.meta.dirname, "../src")

function filesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesIn(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const files = filesIn(src).map((path) => ({ name: relative(src, path), code: readFileSync(path, "utf8") }))

/** Les `new` autorisés hors du container : les erreurs qu'on lève, et les objets de la bibliothèque standard. */
const allowed = /^new (\w*Error|Date|Map|Set|URL)\(/

describe("la règle d'injection", () => {
  it("aucune classe du projet n'est créée par `new` ailleurs que dans container.ts (et server.ts pour le Container)", () => {
    const offenders = files
      .filter((file) => file.name !== "container.ts")
      .flatMap((file) =>
        (file.code.match(/new [A-Z]\w*\(/g) ?? [])
          .filter((call) => !allowed.test(call))
          .filter((call) => !(file.name === "server.ts" && call === "new Container("))
          .map((call) => `${file.name} : ${call}`),
      )
    expect(offenders).toEqual([])
  })

  it("les dépendances vont dans un seul sens : routers → services → repositories", () => {
    const imports = (prefix: string, forbidden: string[]) =>
      files
        .filter((file) => file.name.startsWith(prefix))
        .flatMap((file) =>
          forbidden.filter((folder) => file.code.includes(`from "../${folder}/`)).map((folder) => `${file.name} importe ${folder}/`),
        )
    expect(imports("services/", ["routers"])).toEqual([])
    expect(imports("repositories/", ["services", "routers"])).toEqual([])
    expect(imports("domain/", ["services", "routers", "repositories", "schemas"])).toEqual([])
  })
})
