import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base:"/",
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true, // Prevent Vite from trying other ports
    historyApiFallback: true, // For React Router
  }
 
})

