import type { FastifyInstance } from "fastify";
import type { PageService } from "../services/page.service";
import type { Router } from "./router";

/** Les routes `/books/:id/pages` : une page n'existe que dans un livre. */
export class PageRouter implements Router {
  // À faire : injecter le PageService.
  constructor(readonly pageService: PageService) {}

  register(app: FastifyInstance): void {
    // À faire : déclarer les trois routes des pages, sur le modèle de BookRouter.
    //
    //   POST   /books/:id/pages            201  la page créée    params : bookPagesParamsSchema, body : pageInputSchema
    //   PUT    /books/:id/pages/:pageId    200  la page modifiée params : pageParamsSchema, body : pageInputSchema
    //   DELETE /books/:id/pages/:pageId    204  sans body        params : pageParamsSchema
  }
}
