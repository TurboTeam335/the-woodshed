import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Expose Electron utilities to renderer
contextBridge.exposeInMainWorld('electron', electronAPI)

// Expose typed IPC bridge to renderer
contextBridge.exposeInMainWorld('api', {
  session: {
    generate: () => ipcRenderer.invoke('session:generate'),
    getToday: () => ipcRenderer.invoke('session:get-today'),
    getHistory: (limit?: number) => ipcRenderer.invoke('session:get-history', limit),
    completeBlock: (sessionId: number, blockId: string) =>
      ipcRenderer.invoke('session:complete-block', sessionId, blockId),
    uncompleteBlock: (sessionId: number, blockId: string) =>
      ipcRenderer.invoke('session:uncomplete-block', sessionId, blockId),
    rate: (sessionId: number, rating: number, ratingNote?: string) =>
      ipcRenderer.invoke('session:rate', sessionId, rating, ratingNote)
  },
  gamification: {
    get: () => ipcRenderer.invoke('gamification:get')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    hasApiKey: () => ipcRenderer.invoke('settings:has-api-key'),
    setApiKey: (apiKey: string) => ipcRenderer.invoke('settings:set-api-key', apiKey),
    testApiKey: (apiKey: string) => ipcRenderer.invoke('settings:test-api-key', apiKey),
    removeApiKey: () => ipcRenderer.invoke('settings:remove-api-key')
  }
})
