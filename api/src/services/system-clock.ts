import type { Clock } from "../domain/clock"

/** La vraie horloge, celle du serveur. */
export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}
