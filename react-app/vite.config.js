import { defineConfig } from 'vite'

// Não incluir @vitejs/plugin-react para evitar conflito de dependências.
// O Vite lida com JSX via esbuild por padrão; o plugin melhora HMR/fast-refresh.
export default defineConfig({
  root: '.',
})
