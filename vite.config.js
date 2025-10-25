import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // FIX: Setting base to '' forces Vite to use relative asset paths (./assets/...)
  // This bypasses the server's confusion when resolving the /assets/ path.
  base: '',
})