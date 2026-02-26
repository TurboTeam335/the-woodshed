import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import type { Session, GamificationState, Badge } from '../shared/types'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'woodshed.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema()
  }
  return db
}

function initSchema(): void {
  const database = db

  database.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      date                TEXT NOT NULL UNIQUE,
      generated_at        TEXT NOT NULL,
      title               TEXT NOT NULL,
      coach_message       TEXT NOT NULL,
      blocks              TEXT NOT NULL,
      status              TEXT NOT NULL DEFAULT 'pending',
      rating              INTEGER,
      rating_note         TEXT,
      xp_earned           INTEGER DEFAULT 0,
      completed_at        TEXT,
      completed_block_ids TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS gamification (
      id                  INTEGER PRIMARY KEY CHECK (id = 1),
      total_xp            INTEGER NOT NULL DEFAULT 0,
      current_streak      INTEGER NOT NULL DEFAULT 0,
      longest_streak      INTEGER NOT NULL DEFAULT 0,
      last_session_date   TEXT,
      badges              TEXT NOT NULL DEFAULT '[]',
      sessions_completed  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Ensure single gamification row exists
  database.prepare(`INSERT OR IGNORE INTO gamification (id) VALUES (1)`).run()
}

// ─── Session queries ──────────────────────────────────────────────────────────

export function getSessionById(id: number): Session | null {
  const database = getDb()
  const row = database.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined
  return row ? rowToSession(row) : null
}

export function getSessionByDate(date: string): Session | null {
  const database = getDb()
  const row = database.prepare(`SELECT * FROM sessions WHERE date = ?`).get(date) as
    | Record<string, unknown>
    | undefined
  return row ? rowToSession(row) : null
}

export function getRecentSessions(limit = 20): Session[] {
  const database = getDb()
  const rows = database
    .prepare(`SELECT * FROM sessions ORDER BY date DESC LIMIT ?`)
    .all(limit) as Record<string, unknown>[]
  return rows.map(rowToSession)
}

export function insertSession(session: Omit<Session, 'id'>): Session {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT INTO sessions (date, generated_at, title, coach_message, blocks, status, completed_block_ids)
    VALUES (@date, @generatedAt, @title, @coachMessage, @blocks, @status, @completedBlockIds)
  `)
  const result = stmt.run({
    date: session.date,
    generatedAt: session.generatedAt,
    title: session.title,
    coachMessage: session.coachMessage,
    blocks: JSON.stringify(session.blocks),
    status: session.status,
    completedBlockIds: JSON.stringify(session.completedBlockIds)
  })
  return { ...session, id: result.lastInsertRowid as number }
}

export function updateCompletedBlocks(sessionId: number, completedBlockIds: string[]): void {
  const database = getDb()
  database
    .prepare(`UPDATE sessions SET completed_block_ids = ?, status = 'active' WHERE id = ?`)
    .run(JSON.stringify(completedBlockIds), sessionId)
}

export function completeSession(
  sessionId: number,
  rating: number,
  ratingNote: string | undefined,
  xpEarned: number,
  completedAt: string
): void {
  const database = getDb()
  database
    .prepare(`
      UPDATE sessions
      SET status = 'completed', rating = ?, rating_note = ?, xp_earned = ?, completed_at = ?
      WHERE id = ?
    `)
    .run(rating, ratingNote ?? null, xpEarned, completedAt, sessionId)
}

function rowToSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as number,
    date: row.date as string,
    generatedAt: row.generated_at as string,
    title: row.title as string,
    coachMessage: row.coach_message as string,
    blocks: JSON.parse(row.blocks as string),
    status: row.status as Session['status'],
    rating: row.rating as number | undefined,
    ratingNote: row.rating_note as string | undefined,
    xpEarned: row.xp_earned as number | undefined,
    completedAt: row.completed_at as string | undefined,
    completedBlockIds: JSON.parse(row.completed_block_ids as string)
  }
}

// ─── Gamification queries ─────────────────────────────────────────────────────

export function getGamification(): GamificationState {
  const database = getDb()
  const row = database.prepare(`SELECT * FROM gamification WHERE id = 1`).get() as Record<
    string,
    unknown
  >
  return {
    totalXp: row.total_xp as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    lastSessionDate: row.last_session_date as string | undefined,
    badges: JSON.parse(row.badges as string) as Badge[],
    sessionsCompleted: row.sessions_completed as number
  }
}

export function updateGamification(state: GamificationState): void {
  const database = getDb()
  database
    .prepare(`
      UPDATE gamification SET
        total_xp           = ?,
        current_streak     = ?,
        longest_streak     = ?,
        last_session_date  = ?,
        badges             = ?,
        sessions_completed = ?
      WHERE id = 1
    `)
    .run(
      state.totalXp,
      state.currentStreak,
      state.longestStreak,
      state.lastSessionDate ?? null,
      JSON.stringify(state.badges),
      state.sessionsCompleted
    )
}

// ─── Settings queries ─────────────────────────────────────────────────────────

export function getSetting(key: string): string | null {
  const database = getDb()
  const row = database.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  const database = getDb()
  database
    .prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`)
    .run(key, value)
}
