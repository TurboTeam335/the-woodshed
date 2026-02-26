import { useEffect } from 'react'
import { Flame, Zap, Trophy, TrendingUp, Star, Calendar } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { BadgeGrid } from '../components/Dashboard/BadgeGrid'

function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }): JSX.Element {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 w-16">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={10}
            className={i < rating ? 'text-brand-400 fill-brand-400' : 'text-surface-600'}
          />
        ))}
      </div>
      <div className="flex-1 bg-surface-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 w-5 text-right">{count}</span>
    </div>
  )
}

export default function ProgressView(): JSX.Element {
  const { gamification, sessionHistory, loadHistory } = useStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const g = gamification
  const sessions = sessionHistory.filter((s) => s.status === 'completed')

  // Rating distribution
  const ratingCounts = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: sessions.filter((s) => s.rating === r).length
  }))
  const avgRating =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) / sessions.filter((s) => s.rating).length
      : 0

  // XP per session
  const recentXp = sessions.slice(0, 10).map((s) => s.xpEarned ?? 0)
  const maxXp = Math.max(...recentXp, 1)

  // Block completion by type
  const blockStats: Record<string, { completed: number; total: number }> = {}
  for (const session of sessions) {
    for (const block of session.blocks) {
      if (!blockStats[block.type]) blockStats[block.type] = { completed: 0, total: 0 }
      blockStats[block.type].total++
      if (session.completedBlockIds.includes(block.id)) blockStats[block.type].completed++
    }
  }

  const blockColors: Record<string, string> = {
    technique: 'bg-blue-500',
    rhythm: 'bg-orange-500',
    improvisation: 'bg-purple-500',
    theory: 'bg-yellow-500',
    ear_training: 'bg-teal-500',
    composition: 'bg-green-500',
    creative: 'bg-pink-500'
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-100">Progress</h1>

        {/* Top stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 text-center">
            <Flame size={18} className={`mx-auto mb-1 ${(g?.currentStreak ?? 0) > 0 ? 'text-orange-400' : 'text-gray-700'}`} />
            <div className="text-2xl font-bold text-gray-100">{g?.currentStreak ?? 0}</div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 text-center">
            <Zap size={18} className="mx-auto mb-1 text-brand-400" />
            <div className="text-2xl font-bold text-brand-400">{(g?.totalXp ?? 0).toLocaleString()}</div>
            <div className="text-xs text-gray-600">Total XP</div>
          </div>
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 text-center">
            <Trophy size={18} className="mx-auto mb-1 text-purple-400" />
            <div className="text-2xl font-bold text-gray-100">{g?.sessionsCompleted ?? 0}</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 text-center">
            <TrendingUp size={18} className="mx-auto mb-1 text-green-400" />
            <div className="text-2xl font-bold text-gray-100">{g?.longestStreak ?? 0}</div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
        </div>

        {/* XP per session chart */}
        {recentXp.length > 0 && (
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              XP Per Session (last 10)
            </h3>
            <div className="flex items-end gap-1.5 h-20">
              {recentXp.reverse().map((xp, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-500/60 rounded-sm transition-all"
                    style={{ height: `${(xp / maxXp) * 100}%`, minHeight: '4px' }}
                    title={`+${xp} XP`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-700 mt-1">
              <span>oldest</span>
              <span>latest</span>
            </div>
          </div>
        )}

        {/* Rating distribution */}
        {sessions.length > 0 && (
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rating Distribution
              </h3>
              <span className="text-sm text-gray-400">
                Avg: <span className="font-semibold text-brand-400">{avgRating.toFixed(1)} ★</span>
              </span>
            </div>
            <div className="space-y-2">
              {ratingCounts.reverse().map(({ rating, count }) => (
                <RatingBar key={rating} rating={rating} count={count} total={sessions.length} />
              ))}
            </div>
          </div>
        )}

        {/* Block completion */}
        {Object.keys(blockStats).length > 0 && (
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Block Completion Rate
            </h3>
            <div className="space-y-2.5">
              {Object.entries(blockStats).map(([type, stat]) => {
                const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-28 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <div className="flex-1 bg-surface-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${blockColors[type] ?? 'bg-brand-500'} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent history with calendar view hints */}
        {sessionHistory.length > 0 && (
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={13} className="text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Session Log
              </h3>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {sessionHistory.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between py-1.5 border-b border-surface-700/50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-20">
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`text-xs ${s.status === 'completed' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {s.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.xpEarned != null && s.xpEarned > 0 && (
                      <span className="text-xs text-brand-500">+{s.xpEarned}</span>
                    )}
                    {s.rating && (
                      <span className="text-xs text-gray-500">{s.rating}★</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        <BadgeGrid earned={g?.badges ?? []} />

        <div className="h-8" />
      </div>
    </div>
  )
}
