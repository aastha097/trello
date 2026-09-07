import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pinned to 3001 because the backend's CORS is locked to
// origin: 'http://localhost:3001'. Change both together if you move it.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
  },
})
