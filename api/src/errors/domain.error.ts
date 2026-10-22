/**
 * Une erreur métier : une situation prévue (livre introuvable, règle non respectée), pas un bug.
 * Les services la lèvent, `app.ts` la traduit en statut HTTP. Jamais de `new DomainError` : on lève une fille.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

/** La ressource demandée n'existe pas : 404. */
export class NotFoundError extends DomainError {}

/** Les données sont bien formées mais une règle métier les refuse : 400. */
export class ValidationError extends DomainError {}

/** L'opération entre en conflit avec l'existant (doublon) : 409. */
export class ConflictError extends DomainError {}
