import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  bookPagesParamsSchema,
  pageInputSchema,
  pageParamsSchema,
} from "../schemas/page.schema";
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
    const routes = app.withTypeProvider<ZodTypeProvider>();

    routes.post(
      "/books/:id/pages",
      {
        schema: { params: bookPagesParamsSchema, body: pageInputSchema },
      },
      async (request, reply) => {
        const id = request.params.id;
        const reqBody = request.body;

        const createdPage = await this.pageService.add(id, reqBody);

        return reply.code(201).send(createdPage);
      },
    );

    routes.put(
      "/books/:id/pages/:pageId",
      {
        schema: { params: pageParamsSchema, body: pageInputSchema },
      },
      async (request, reply) => {
        const pageId = request.params.pageId;
        const id = request.params.id;
        const reqBody = request.body;

        const updatedPage = await this.pageService.update(id, pageId, reqBody);

        return reply.code(200).send(updatedPage);
      },
    );

    routes.delete(
      "/books/:id/pages/:pageId",
      {
        schema: { params: pageParamsSchema },
      },
      async (request, reply) => {
        const pageId = request.params.pageId;
        const id = request.params.id;

        const deletedPage = await this.pageService.delete(id, pageId);

        return reply.code(204).send(deletedPage);
      },
    );
  }
}
