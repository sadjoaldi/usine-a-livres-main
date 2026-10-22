import { createRouter, createWebHistory } from "vue-router"
import BookDetailView from "./views/BookDetailView.vue"
import BookListView from "./views/BookListView.vue"

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "books", component: BookListView },
    { path: "/livres/:id(\\d+)", name: "book", component: BookDetailView, props: (route) => ({ id: Number(route.params.id) }) },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
})
