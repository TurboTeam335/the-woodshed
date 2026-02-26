import { create } from 'zustand'
import type { Session, GamificationState, AppSettings } from '../../../shared/types'

interface AppState {
  // App init
  isLoaded: boolean
  hasApiKey: boolean

  // Today's session
  todaySession: Session | null
  isGenerating: boolean
  generateError: string | null

  // Session history
  sessionHistory: Session[]

  // Gamification
  gamification: GamificationState | null

  // Settings
  settings: AppSettings | null

  // New badges from last rating (for celebration UI)
  newBadges: GamificationState['badges']

  // Actions
  initApp: () => Promise<void>
  generateSession: () => Promise<void>
  completeBlock: (blockId: string) => Promise<void>
  uncompleteBlock: (blockId: string) => Promise<void>
  submitRating: (rating: number, note?: string) => Promise<void>
  loadHistory: () => Promise<void>
  refreshGamification: () => Promise<void>
  saveApiKey: (key: string) => Promise<{ success: boolean; error?: string }>
  removeApiKey: () => Promise<void>
  testApiKey: (key: string) => Promise<{ success: boolean; error?: string }>
  clearNewBadges: () => void
}

export const useStore = create<AppState>((set, get) => ({
  isLoaded: false,
  hasApiKey: false,
  todaySession: null,
  isGenerating: false,
  generateError: null,
  sessionHistory: [],
  gamification: null,
  settings: null,
  newBadges: [],

  initApp: async () => {
    const [settingsRes, gamRes, sessionRes] = await Promise.all([
      window.api.settings.get(),
      window.api.gamification.get(),
      window.api.session.getToday()
    ])

    set({
      isLoaded: true,
      hasApiKey: settingsRes.data?.hasApiKey ?? false,
      settings: settingsRes.data ?? null,
      gamification: gamRes.data ?? null,
      todaySession: sessionRes.data ?? null
    })
  },

  generateSession: async () => {
    set({ isGenerating: true, generateError: null })
    const result = await window.api.session.generate()
    if (result.success && result.data) {
      set({ todaySession: result.data, isGenerating: false })
    } else {
      set({ isGenerating: false, generateError: result.error ?? 'Unknown error' })
    }
  },

  completeBlock: async (blockId: string) => {
    const { todaySession } = get()
    if (!todaySession?.id) return
    const result = await window.api.session.completeBlock(todaySession.id, blockId)
    if (result.success && result.data) {
      set({
        todaySession: {
          ...todaySession,
          completedBlockIds: result.data.completedBlockIds,
          status: 'active'
        }
      })
    }
  },

  uncompleteBlock: async (blockId: string) => {
    const { todaySession } = get()
    if (!todaySession?.id) return
    const result = await window.api.session.uncompleteBlock(todaySession.id, blockId)
    if (result.success && result.data) {
      set({
        todaySession: {
          ...todaySession,
          completedBlockIds: result.data.completedBlockIds
        }
      })
    }
  },

  submitRating: async (rating: number, note?: string) => {
    const { todaySession, gamification } = get()
    if (!todaySession?.id) return
    const result = await window.api.session.rate(todaySession.id, rating, note)
    if (result.success && result.data) {
      const oldBadgeIds = new Set(gamification?.badges.map((b) => b.id) ?? [])
      const newBadges = result.data.badges.filter((b) => !oldBadgeIds.has(b.id))
      set({
        todaySession: { ...todaySession, status: 'completed', rating, ratingNote: note },
        gamification: result.data,
        newBadges
      })
    }
  },

  loadHistory: async () => {
    const result = await window.api.session.getHistory(30)
    if (result.success && result.data) {
      set({ sessionHistory: result.data })
    }
  },

  refreshGamification: async () => {
    const result = await window.api.gamification.get()
    if (result.success && result.data) {
      set({ gamification: result.data })
    }
  },

  saveApiKey: async (key: string) => {
    const result = await window.api.settings.setApiKey(key)
    if (result.success) {
      set({ hasApiKey: true, settings: { hasApiKey: true, maskedApiKey: key.slice(0, 10) + '...' + key.slice(-4) } })
    }
    return { success: result.success, error: result.error }
  },

  removeApiKey: async () => {
    await window.api.settings.removeApiKey()
    set({ hasApiKey: false, settings: { hasApiKey: false } })
  },

  testApiKey: async (key: string) => {
    const result = await window.api.settings.testApiKey(key)
    return { success: result.success, error: result.error }
  },

  clearNewBadges: () => set({ newBadges: [] })
}))
