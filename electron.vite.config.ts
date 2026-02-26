import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()],
    // alphaTab uses Web Workers and loads assets from CDN in this config.
    // See NotationDisplay.tsx for CDN configuration details.
    optimizeDeps: {
      exclude: ['@coderline/alphatab']
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
})
