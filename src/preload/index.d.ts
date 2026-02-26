import type { IpcResult, Session, GamificationState, AppSettings } from '../shared/types'

declare global {
  interface Window {
    api: {
      session: {
        generate: () => Promise<IpcResult<Session>>
        getToday: () => Promise<IpcResult<Session | null>>
        getHistory: (limit?: number) => Promise<IpcResult<Session[]>>
        completeBlock: (
          sessionId: number,
          blockId: string
        ) => Promise<IpcResult<{ completedBlockIds: string[] }>>
        uncompleteBlock: (
          sessionId: number,
          blockId: string
        ) => Promise<IpcResult<{ completedBlockIds: string[] }>>
        rate: (
          sessionId: number,
          rating: number,
          ratingNote?: string
        ) => Promise<IpcResult<GamificationState>>
      }
      gamification: {
        get: () => Promise<IpcResult<GamificationState>>
      }
      settings: {
        get: () => Promise<IpcResult<AppSettings>>
        hasApiKey: () => Promise<IpcResult<boolean>>
        setApiKey: (apiKey: string) => Promise<IpcResult>
        testApiKey: (apiKey: string) => Promise<IpcResult>
        removeApiKey: () => Promise<IpcResult>
      }
    }
  }
}
