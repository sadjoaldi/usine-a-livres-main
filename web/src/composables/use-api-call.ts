import { ref } from "vue"
import { ApiError } from "../api/book-api"

/** Lance un appel à l'API et range son erreur dans `error`, pour que l'écran l'affiche au lieu de planter. */
export function useApiCall() {
  const error = ref<ApiError | null>(null)
  const pending = ref(false)

  async function call<T>(action: () => Promise<T>): Promise<T | undefined> {
    error.value = null
    pending.value = true
    try {
      return await action()
    } catch (caught) {
      error.value = caught instanceof ApiError ? caught : new ApiError(-1, String(caught), "", false)
      return undefined
    } finally {
      pending.value = false
    }
  }

  return { error, pending, call }
}
