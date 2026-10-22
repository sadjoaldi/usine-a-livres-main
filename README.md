# Usine à livres

Une application complète de gestion de livres : une API REST en **Fastify** (`api/`) et un front **Vue 3** (`web/`).
On crée des livres, on leur ajoute des pages, on les modifie, on les supprime.

Le front est fourni et fonctionne. L'API est à écrire : toutes les classes existent déjà, avec leurs méthodes, et
des commentaires `À faire` qui disent quoi injecter et quoi lever. Aucun ordre imposé : lire le code, comprendre qui
dépend de qui, compléter là où il faut.

## Lancer

Node 22.12 ou plus récent (`node -v`).

```bash
npm install
npm run dev          # API sur http://localhost:3000, front sur http://localhost:5173
npm test             # les tests de l'API
npm run type-check   # TypeScript sur l'API et sur le front
```

`npm run dev` lance les deux serveurs dans le même terminal (préfixes `[api]` et `[web]`) et les relance à chaque
sauvegarde. Ouvrir http://localhost:5173.

Au départ, le front affiche **« Route non implémentée côté API »** avec la requête concernée (`GET /books`) : c'est
normal, aucune route n'existe encore. Le message disparaît route par route.

## Le domaine

| Type   | Champs                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `Book` | `id`, `title`, `author`, `genre` (`"roman"`, `"essai"`, `"bd"`, `"poesie"`, `"jeunesse"`), `createdAt` (ISO), `pageCount` |
| `Page` | `id`, `bookId`, `number`, `content`                                                                                       |

Les règles :

- `pageCount` est **calculé** à chaque lecture, jamais stocké
- `number` est **attribué par le service** : 1, 2, 3… sans trou ; le client ne le choisit pas
- supprimer une page **renumérote** les suivantes : 1, 2, 3 moins la 2 donne 1, 2
- supprimer un livre supprime **ses pages**
- un même auteur n'a pas deux livres du même titre (casse et espaces ignorés) : **409**
- un livre a un plafond de pages (1 000, 5 dans les tests) : au-delà, **400**

Les types sont écrits dans `api/src/domain/` : les lire avant tout.

## Les routes

| Requête                           | Body                       | Succès                              | Erreurs       |
| --------------------------------- | -------------------------- | ----------------------------------- | ------------- |
| `GET /books`                      |                            | 200, la liste                       |               |
| `GET /books/:id`                  |                            | 200, le livre et ses `pages` triées | 400, 404      |
| `POST /books`                     | `{ title, author, genre }` | **201**, le livre créé              | 400, 409      |
| `PUT /books/:id`                  | `{ title, author, genre }` | 200, le livre modifié               | 400, 404, 409 |
| `DELETE /books/:id`               |                            | **204**, sans body                  | 400, 404      |
| `POST /books/:id/pages`           | `{ content }`              | **201**, la page créée              | 400, 404      |
| `PUT /books/:id/pages/:pageId`    | `{ content }`              | 200, la page modifiée               | 400, 404      |
| `DELETE /books/:id/pages/:pageId` |                            | **204**, sans body                  | 400, 404      |

Toute erreur répond le même body :

```json
{ "error": "NotFoundError", "message": "Livre 42 introuvable" }
```

| Statut | `error`               | Quand                                                            |
| ------ | --------------------- | ---------------------------------------------------------------- |
| 400    | `ValidationError`     | body ou params refusés par Zod ; règle métier (plafond de pages) |
| 404    | `NotFoundError`       | livre ou page inconnu, page d'un autre livre                     |
| 404    | `RouteNotFound`       | route inexistante (fourni)                                       |
| 409    | `ConflictError`       | doublon titre + auteur                                           |
| 500    | `InternalServerError` | tout le reste, message générique                                 |

## La carte des dossiers

```plaintext
api/
├── src/
│   ├── server.ts                  lance le serveur                                 fourni
│   ├── app.ts                     buildApp : Fastify, Zod, CORS, erreurs, routers   à compléter
│   ├── container.ts               LE seul endroit des new                          à compléter
│   ├── domain/                    les types du métier, l'interface Clock           fourni
│   ├── errors/domain.error.ts     DomainError et ses filles                        fourni
│   ├── schemas/                   les schemas Zod                                  à compléter
│   ├── repositories/              les interfaces et leurs implémentations          à compléter
│   ├── services/                  BookService, PageService, SystemClock            à compléter
│   └── routers/                   BookRouter, PageRouter, l'interface Router       à compléter
└── tests/                         les tests Vitest, par app.inject                 fourni
web/                               le front Vue 3                                   fourni
```

## La règle d'injection

```plaintext
                        container.ts
              crée chaque objet, une fois, et le passe
                              │
          ┌───────────────────┼─────────────────────┐
          ▼                   ▼                     ▼
      routers/  ────────>  services/  ────────>  repositories/
      HTTP                 règles métier         données
      BookRouter           BookService           BookRepository (interface)
      PageRouter           PageService           InMemory…, JsonFile…
```

- Une classe **reçoit** ses dépendances par son constructeur, elle ne les **crée** jamais
- Les dépendances vont dans **un seul sens** : router → service → repository
- Un repository ignore les services ; un service ignore Fastify (ni `reply`, ni statut HTTP)
- `new` sur une classe du projet : **seulement dans `container.ts`** (plus `new Container()` dans `server.ts`)
- Les erreurs font exception : `throw new NotFoundError(...)` là où vit la règle, dans le service
- Une dépendance se type par son **interface** (`BookRepository`), jamais par une classe (`InMemoryBookRepository`)

```ts
// Non : le service fabrique son repository, impossible d'en changer sans réécrire le service
export class BookService {
  private readonly bookRepository = new InMemoryBookRepository();
}

// Oui : le service reçoit un BookRepository, n'importe lequel ; container.ts choisit
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}
}
```

Dès qu'un constructeur réclame une dépendance, `npm run type-check` signale le `new` à compléter dans
`container.ts`. `tests/architecture.test.ts` vérifie la règle : aucun `new` de classe du projet hors du container, et
aucun import dans le mauvais sens.

## Ce qui est à faire

Chaque fichier contient ses commentaires `À faire`. En résumé :

| Fichier                                     | À faire                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `schemas/book.schema.ts`                    | `bookInputSchema` : `title`, `author`, `genre`, messages en français                                   |
| `schemas/page.schema.ts`                    | `pageInputSchema` (`content`), `bookPagesParamsSchema`, `pageParamsSchema`                             |
| `repositories/in-memory-book.repository.ts` | le rangement interne, le compteur d'id, les cinq méthodes                                              |
| `repositories/in-memory-page.repository.ts` | idem, les six méthodes ; `findByBookId` trie par numéro                                                |
| `services/book.service.ts`                  | injecter `BookRepository`, `PageRepository`, `Clock` ; `list`, `getById`, `create`, `update`, `delete` |
| `services/page.service.ts`                  | injecter `PageRepository`, `BookRepository`, le plafond ; `add`, `update`, `delete` (renumérotation)   |
| `routers/book.router.ts`                    | injecter `BookService` ; déclarer les cinq routes des livres dans `register`                           |
| `routers/page.router.ts`                    | injecter `PageService` ; déclarer les trois routes des pages                                           |
| `container.ts`                              | créer repositories, services, routers ; passer `config.clock` et `config.maxPagesPerBook`              |
| `app.ts`                                    | traduire les erreurs en statuts dans `setErrorHandler` ; brancher les routers du container             |

Lire aussi ce qui est fourni : `domain/` (les types), `repositories/book.repository.ts` et `page.repository.ts` (les
contrats), `errors/domain.error.ts`, `schemas/id.schema.ts` (un schema complet, avec `z.coerce`),
`services/system-clock.ts` (une classe qui implémente une interface), `routers/router.ts`.

Une méthode encore vide lève `À faire` : l'API répond 501 et le front affiche « Route non implémentée côté API ».

## Tester

### Les tests

```bash
npm test                     # une fois
npm run test:watch -w api    # relancés à chaque sauvegarde
```

Un test = une phrase qui dit ce qui marche, par exemple `PUT /books/:id/pages/:pageId > renvoie 404 pour la page
d'un autre livre`. Quatre passent dès le départ (ce qui est fourni : route inconnue, CORS, architecture). Les tests
construisent le container avec une horloge fixe et un plafond de 5 pages : si ces options n'arrivent pas jusqu'aux
services, des tests échouent. `tests/json-file.test.ts` concerne le bonus.

### Postman

Créer une collection `Usine à livres`, une requête par ligne, dans l'ordre. Body : **raw**, puis **JSON**.

```plaintext
GET     http://localhost:3000/books                      -> 200  []
POST    http://localhost:3000/books                      -> 201  { "id": 1, ..., "pageCount": 0 }
        { "title": "Dune", "author": "Frank Herbert", "genre": "roman" }
POST    http://localhost:3000/books                      -> 409  (même titre, même auteur)
        { "title": "dune", "author": "frank herbert", "genre": "roman" }
POST    http://localhost:3000/books                      -> 400
        { "title": "", "author": "X", "genre": "polar" }
GET     http://localhost:3000/books/1                    -> 200  { ..., "pages": [] }
GET     http://localhost:3000/books/999                  -> 404
GET     http://localhost:3000/books/abc                  -> 400
PUT     http://localhost:3000/books/1                    -> 200
        { "title": "Dune, tome 1", "author": "Frank Herbert", "genre": "roman" }
POST    http://localhost:3000/books/1/pages              -> 201  { "number": 1, ... }
        { "content": "Page un" }
POST    http://localhost:3000/books/1/pages              -> 201  { "number": 2, ... }
        { "content": "Page deux" }
POST    http://localhost:3000/books/1/pages              -> 201  { "number": 3, ... }
        { "content": "Page trois" }
PUT     http://localhost:3000/books/1/pages/2            -> 200
        { "content": "Page deux, relue" }
DELETE  http://localhost:3000/books/1/pages/1            -> 204
GET     http://localhost:3000/books/1                    -> 200  pages numérotées 1 et 2
DELETE  http://localhost:3000/books/1                    -> 204
GET     http://localhost:3000/books/1                    -> 404
```

Lire le **statut** avant le body. Sur un `DELETE`, ne pas mettre de body : avec un en-tête `Content-Type:
application/json` et un body vide, Fastify répond 400.

## Bonus : stockage en fichiers JSON

En mémoire, tout est perdu à chaque redémarrage. Le bonus range livres et pages dans `api/data/books.json` et
`api/data/pages.json`, sans toucher à un seul service ni router :

1. écrire `repositories/json-file.ts`, `json-file-book.repository.ts`, `json-file-page.repository.ts` ;
2. écrire `bookRecordSchema` et `pageRecordSchema` : le contenu du fichier est vérifié à la lecture ;
3. dans `container.ts`, créer les repositories JSON quand `config.storage` vaut `"json"` ;
4. passer **une ligne** de `container.ts` à `"json"` : `const STORAGE: Storage = "json"`.

Vérifier : créer un livre, arrêter `npm run dev`, relancer, le livre est toujours là. `tests/json-file.test.ts`
passe. Le dossier `api/data/` n'est pas versionné.
# usine-a-livres-main
