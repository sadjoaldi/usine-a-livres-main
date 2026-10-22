import { createApp } from "vue"
import App from "./App.vue"
import { BookApi } from "./api/book-api"
import { bookApiKey } from "./api/book-api.key"
import { router } from "./router"
import "./style.css"

// Le seul new du front : le client HTTP, fourni à tous les composants.
const api = new BookApi(import.meta.env.VITE_API_URL ?? "http://localhost:3000")

createApp(App).use(router).provide(bookApiKey, api).mount("#app")
