import type { FastifyInstance } from "fastify"

/** Ce que tout router sait faire : déclarer ses routes sur l'application Fastify. */
export interface Router {
  register(app: FastifyInstance): void
}
