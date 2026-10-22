/** L'horloge, injectée dans les services : en test, une horloge fixe rend `createdAt` prévisible. */
export interface Clock {
  now(): Date
}
