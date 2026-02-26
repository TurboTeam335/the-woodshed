// ─── Block / Exercise types ─────────────────────────────────────────────────

export type BlockType =
  | 'technique'
  | 'rhythm'
  | 'improvisation'
  | 'theory'
  | 'ear_training'
  | 'composition'
  | 'creative'

export type NoteTechnique = 'h' | 'p' | 'b' | 's' | 'v'

export interface NoteBeat {
  /** Guitar string: 1 = high e (thinnest), 6 = low E (thickest) */
  string: number
  fret: number
  /** Note duration: 1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth */
  duration: number
  technique?: NoteTechnique
  accent?: boolean
  ghostNote?: boolean
  isRest?: boolean
}

export interface NotationMeasure {
  beats: NoteBeat[]
}

export interface ExerciseNotation {
  tempo?: number
  /** e.g. "4/4", "3/4", "6/8" */
  timeSignature?: string
  measures: NotationMeasure[]
  /** Human-readable description of what this notation demonstrates */
  notes?: string
}

export interface Exercise {
  id: string
  title: string
  description: string
  notation?: ExerciseNotation
}

export interface SessionBlock {
  id: string
  type: BlockType
  title: string
  durationMinutes: number
  /** 1–10 */
  difficulty: number
  /** Base XP awarded for completing this block */
  xpValue: number
  instructions: string
  exercises: Exercise[]
  /** Creative/bonus blocks are optional */
  isOptional?: boolean
}

// ─── Session ─────────────────────────────────────────────────────────────────

export type SessionStatus = 'pending' | 'active' | 'completed'

export interface Session {
  id?: number
  /** YYYY-MM-DD */
  date: string
  generatedAt: string
  title: string
  coachMessage: string
  blocks: SessionBlock[]
  status: SessionStatus
  rating?: number
  ratingNote?: string
  xpEarned?: number
  completedAt?: string
  /** IDs of blocks the user has marked complete */
  completedBlockIds: string[]
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface Badge {
  id: string
  name: string
  description: string
  earnedAt: string
  icon: string
}

export interface GamificationState {
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastSessionDate?: string
  badges: Badge[]
  sessionsCompleted: number
}

// Badge definitions — checked after each session completion
export const BADGE_DEFINITIONS: Array<{
  id: string
  name: string
  description: string
  icon: string
  check: (g: GamificationState, session?: Session) => boolean
}> = [
  {
    id: 'first_session',
    name: 'First Session',
    description: 'Complete your first practice session',
    icon: '🎸',
    check: (g) => g.sessionsCompleted >= 1
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Practice 3 days in a row',
    icon: '🔥',
    check: (g) => g.longestStreak >= 3
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    icon: '⚡',
    check: (g) => g.longestStreak >= 7
  },
  {
    id: 'streak_30',
    name: 'Monthly Grind',
    description: '30-day streak',
    icon: '🏆',
    check: (g) => g.longestStreak >= 30
  },
  {
    id: 'sessions_5',
    name: 'Getting Serious',
    description: 'Complete 5 sessions',
    icon: '💪',
    check: (g) => g.sessionsCompleted >= 5
  },
  {
    id: 'sessions_10',
    name: 'In the Zone',
    description: 'Complete 10 sessions',
    icon: '🎯',
    check: (g) => g.sessionsCompleted >= 10
  },
  {
    id: 'sessions_30',
    name: 'Woodshed Veteran',
    description: 'Complete 30 sessions',
    icon: '🥷',
    check: (g) => g.sessionsCompleted >= 30
  },
  {
    id: 'xp_1000',
    name: 'Level Up',
    description: 'Earn 1,000 XP',
    icon: '⭐',
    check: (g) => g.totalXp >= 1000
  },
  {
    id: 'xp_5000',
    name: 'Master Class',
    description: 'Earn 5,000 XP',
    icon: '🌟',
    check: (g) => g.totalXp >= 5000
  },
  {
    id: 'perfect_session',
    name: 'Perfect Session',
    description: 'Rate a session 5 stars',
    icon: '✨',
    check: (_g, session) => session?.rating === 5
  }
]

// ─── IPC response envelope ────────────────────────────────────────────────────

export interface IpcResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  hasApiKey: boolean
  /** Masked version, e.g. "sk-ant-...xyz" */
  maskedApiKey?: string
}
