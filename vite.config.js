import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  server: {
    // Configuración para desarrollo
    historyApiFallback: true
  },
  build: {
    // Configuración para producción
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  preview: {
    // Configuración para preview
    historyApiFallback: true
  }
})
