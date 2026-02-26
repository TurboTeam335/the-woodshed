import { ipcMain, safeStorage } from 'electron'
import type { IpcResult, Session, GamificationState, AppSettings } from '../shared/types'
import { BADGE_DEFINITIONS } from '../shared/types'
import {
  getSessionByDate,
  getSessionById,
  getRecentSessions,
  insertSession,
  updateCompletedBlocks,
  completeSession,
  getGamification,
  updateGamification,
  getSetting,
  setSetting
} from './database'
import { generateSession } from './claude'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '***'
  return key.slice(0, 10) + '...' + key.slice(-4)
}

export function registerIpcHandlers(): void {
  // ── Session: generate ────────────────────────────────────────────────────
  ipcMain.handle('session:generate', async (): Promise<IpcResult<Session>> => {
    try {
      const encryptedKey = getSetting('api_key_encrypted')
      if (!encryptedKey) {
        return { success: false, error: 'No API key configured. Go to Settings to add your Anthropic API key.' }
      }

      const apiKey = safeStorage.decryptString(Buffer.from(encryptedKey, 'base64'))
      const date = today()

      // Don't regenerate if one already exists for today
      const existing = getSessionByDate(date)
      if (existing) {
        return { success: true, data: existing }
      }

      const history = getRecentSessions(15)
      const gamification = getGamification()

      const generated = await generateSession(apiKey, history, gamification, date)

      const session = insertSession({
        date,
        generatedAt: new Date().toISOString(),
        title: generated.title,
        coachMessage: generated.coachMessage,
        blocks: generated.blocks,
        status: 'pending',
        completedBlockIds: []
      })

      return { success: true, data: session }
    } catch (err) {
      console.error('[session:generate]', err)
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── Session: get today ───────────────────────────────────────────────────
  ipcMain.handle('session:get-today', (): IpcResult<Session | null> => {
    try {
      const session = getSessionByDate(today())
      return { success: true, data: session }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Session: get history ─────────────────────────────────────────────────
  ipcMain.handle('session:get-history', (_e, limit: number = 20): IpcResult<Session[]> => {
    try {
      return { success: true, data: getRecentSessions(limit) }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Session: complete a block ────────────────────────────────────────────
  ipcMain.handle(
    'session:complete-block',
    (_e, sessionId: number, blockId: string): IpcResult<{ completedBlockIds: string[] }> => {
      try {
        const session = getSessionById(sessionId)
        if (!session || session.id == null) {
          return { success: false, error: 'Session not found' }
        }
        const updated = session.completedBlockIds.includes(blockId)
          ? session.completedBlockIds
          : [...session.completedBlockIds, blockId]
        updateCompletedBlocks(session.id, updated)
        return { success: true, data: { completedBlockIds: updated } }
      } catch (err) {
        return { success: false, error: String(err) }
      }
    }
  )

  // ── Session: unmark a block ──────────────────────────────────────────────
  ipcMain.handle(
    'session:uncomplete-block',
    (_e, sessionId: number, blockId: string): IpcResult<{ completedBlockIds: string[] }> => {
      try {
        const session = getSessionById(sessionId)
        if (!session || session.id == null) {
          return { success: false, error: 'Session not found' }
        }
        const updated = session.completedBlockIds.filter((id) => id !== blockId)
        updateCompletedBlocks(session.id, updated)
        return { success: true, data: { completedBlockIds: updated } }
      } catch (err) {
        return { success: false, error: String(err) }
      }
    }
  )

  // ── Session: rate and finalize ───────────────────────────────────────────
  ipcMain.handle(
    'session:rate',
    (
      _e,
      sessionId: number,
      rating: number,
      ratingNote: string | undefined
    ): IpcResult<GamificationState> => {
      try {
        const session = getSessionById(sessionId)
        if (!session) {
          return { success: false, error: 'Session not found' }
        }

        // Calculate XP
        const completedBlocks = session.blocks.filter((b) =>
          session.completedBlockIds.includes(b.id)
        )
        const blockXp = completedBlocks.reduce((sum, b) => sum + b.xpValue, 0)
        const allComplete = completedBlocks.length === session.blocks.filter((b) => !b.isOptional).length
        const completionBonus = allComplete ? 50 : 0
        const ratingBonus = rating * 10

        const gamification = getGamification()
        const streakBonus = Math.min(gamification.currentStreak * 5, 50)
        const xpEarned = blockXp + completionBonus + ratingBonus + streakBonus

        // Update streak
        const lastDate = gamification.lastSessionDate
        const todayStr = today()
        let newStreak = 1
        if (lastDate) {
          const dayDiff = Math.round(
            (new Date(todayStr).getTime() - new Date(lastDate).getTime()) / 86400000
          )
          if (dayDiff === 1) {
            newStreak = gamification.currentStreak + 1
          } else if (dayDiff === 0) {
            // Same day re-rate — don't double-count streak
            newStreak = gamification.currentStreak
          }
        }

        const newLongest = Math.max(gamification.longestStreak, newStreak)
        const newSessions = gamification.sessionsCompleted + 1
        const newTotalXp = gamification.totalXp + xpEarned

        // Check badges
        const updatedGamification: GamificationState = {
          totalXp: newTotalXp,
          currentStreak: newStreak,
          longestStreak: newLongest,
          lastSessionDate: todayStr,
          badges: [...gamification.badges],
          sessionsCompleted: newSessions
        }

        const ratedSession = { ...session, rating, ratingNote, xpEarned }
        const existingBadgeIds = new Set(gamification.badges.map((b) => b.id))

        for (const def of BADGE_DEFINITIONS) {
          if (!existingBadgeIds.has(def.id) && def.check(updatedGamification, ratedSession)) {
            updatedGamification.badges.push({
              id: def.id,
              name: def.name,
              description: def.description,
              icon: def.icon,
              earnedAt: new Date().toISOString()
            })
          }
        }

        // Persist
        completeSession(sessionId, rating, ratingNote, xpEarned, new Date().toISOString())
        updateGamification(updatedGamification)

        return { success: true, data: updatedGamification }
      } catch (err) {
        console.error('[session:rate]', err)
        return { success: false, error: String(err) }
      }
    }
  )

  // ── Gamification: get ────────────────────────────────────────────────────
  ipcMain.handle('gamification:get', (): IpcResult<GamificationState> => {
    try {
      return { success: true, data: getGamification() }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Settings: has key ────────────────────────────────────────────────────
  ipcMain.handle('settings:has-api-key', (): IpcResult<boolean> => {
    try {
      const encrypted = getSetting('api_key_encrypted')
      return { success: true, data: !!encrypted }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Settings: get (returns masked key only) ──────────────────────────────
  ipcMain.handle('settings:get', (): IpcResult<AppSettings> => {
    try {
      const encrypted = getSetting('api_key_encrypted')
      if (!encrypted) {
        return { success: true, data: { hasApiKey: false } }
      }
      const apiKey = safeStorage.decryptString(Buffer.from(encrypted, 'base64'))
      return {
        success: true,
        data: { hasApiKey: true, maskedApiKey: maskApiKey(apiKey) }
      }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Settings: set API key ────────────────────────────────────────────────
  ipcMain.handle('settings:set-api-key', (_e, apiKey: string): IpcResult => {
    try {
      if (!apiKey.startsWith('sk-ant-')) {
        return { success: false, error: 'Invalid API key format. Key should start with sk-ant-' }
      }
      const encrypted = safeStorage.encryptString(apiKey)
      setSetting('api_key_encrypted', encrypted.toString('base64'))
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  // ── Settings: test API key ───────────────────────────────────────────────
  ipcMain.handle('settings:test-api-key', async (_e, apiKey: string): Promise<IpcResult> => {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      // Minimal API call to verify key
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('401') || msg.includes('invalid') || msg.includes('authentication')) {
        return { success: false, error: 'Invalid API key' }
      }
      return { success: false, error: `API error: ${msg}` }
    }
  })

  // ── Settings: remove API key ─────────────────────────────────────────────
  ipcMain.handle('settings:remove-api-key', (): IpcResult => {
    try {
      setSetting('api_key_encrypted', '')
      return { success: true }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
