import type { FastifyInstance } from "fastify"
import { buildApp } from "../src/app"
import { Container, type ContainerOptions } from "../src/container"

/** L'heure de tous les tests : `createdAt` vaut toujours cette date. */
export const NOW = "2026-10-20T08:00:00.000Z"

/**
 * Une application neuve pour chaque test, en mémoire, avec une horloge fixe et un plafond de 5 pages.
 * C'est le container qui reçoit ces options : il doit les passer aux bons constructeurs.
 */
export function makeApp(options: Partial<ContainerOptions> = {}): FastifyInstance {
  const container = new Container({
    storage: "memory",
    clock: { now: () => new Date(NOW) },
    maxPagesPerBook: 5,
    ...options,
  })
  return buildApp(container)
}

export const dune = { title: "Dune", author: "Frank Herbert", genre: "roman" } as const

/** Crée un livre par l'API et renvoie son id. */
export async function createBook(app: FastifyInstance, book: object = dune): Promise<number> {
  const response = await app.inject({ method: "POST", url: "/books", payload: book })
  if (response.statusCode !== 201) throw new Error(`POST /books : ${response.statusCode} ${response.body}`)
  return response.json<{ id: number }>().id
}

/** Ajoute une page par l'API et renvoie son id. */
export async function addPage(app: FastifyInstance, bookId: number, content: string): Promise<number> {
  const response = await app.inject({ method: "POST", url: `/books/${bookId}/pages`, payload: { content } })
  if (response.statusCode !== 201) throw new Error(`POST /books/${bookId}/pages : ${response.statusCode} ${response.body}`)
  return response.json<{ id: number }>().id
}
