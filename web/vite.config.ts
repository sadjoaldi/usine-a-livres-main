import tailwindcss from "@tailwindcss/vite"
import vue from "@vitejs/plugin-vue"
import { defineConfig } from "vite"

// Port fixe : l'API n'autorise (CORS) que http://localhost:5173.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: { port: 5173, strictPort: true },
})
