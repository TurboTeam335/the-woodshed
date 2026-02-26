import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, Trophy, Guitar } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/Dashboard/StatCard'
import { BadgeGrid } from '../components/Dashboard/BadgeGrid'
import { RecentSessions } from '../components/Dashboard/RecentSessions'

export default function DashboardView(): JSX.Element {
  const navigate = useNavigate()
  const {
    todaySession,
    gamification,
    sessionHistory,
    hasApiKey,
    isGenerating,
    generateError,
    generateSession,
    loadHistory
  } = useStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const g = gamification
  const streak = g?.currentStreak ?? 0
  const xp = g?.totalXp ?? 0
  const sessions = g?.sessionsCompleted ?? 0
  const badges = g?.badges ?? []

  const sessionStatusText = todaySession
    ? todaySession.status === 'completed'
      ? 'Completed today'
      : todaySession.status === 'active'
      ? 'In progress'
      : 'Generated — ready to start'
    : null

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {streak > 0 ? `Day ${sessions + 1}` : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Today's session CTA */}
        <div className="bg-surface-800 border border-surface-700 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-100">
                {todaySession ? todaySession.title : "Today's Session"}
              </h2>
              {todaySession ? (
                <p className="text-sm text-gray-500 mt-1">{sessionStatusText}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  Ready when you are. Claude will build on your history.
                </p>
              )}
              {generateError && (
                <p className="text-xs text-red-400 mt-2 max-w-sm">
                  {generateError.includes('No API key') ? (
                    <>No API key configured. <button className="underline text-brand-400" onClick={() => navigate('/settings')}>Add one in Settings.</button></>
                  ) : generateError}
                </p>
              )}
            </div>
            {todaySession ? (
              <Button variant="primary" onClick={() => navigate('/session')}>
                {todaySession.status === 'completed' ? 'Review Session' : 'Continue'}
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={isGenerating}
                onClick={() => hasApiKey ? generateSession() : navigate('/settings')}
              >
                {!hasApiKey ? 'Setup API Key' : isGenerating ? 'Generating...' : 'Generate Session'}
              </Button>
            )}
          </div>

          {/* Session block preview */}
          {todaySession && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {todaySession.blocks.map((block) => {
                const isComplete = todaySession.completedBlockIds.includes(block.id)
                return (
                  <span
                    key={block.id}
                    className={[
                      'px-2 py-0.5 rounded text-xs font-medium border',
                      isComplete
                        ? 'bg-green-900/20 text-green-400 border-green-900/40 line-through'
                        : 'bg-surface-700 text-gray-400 border-surface-600'
                    ].join(' ')}
                  >
                    {block.type.replace('_', ' ')}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Flame size={14} />}
            label="Streak"
            value={streak}
            sub={streak === 1 ? 'day' : 'days'}
            accent={streak > 0 ? 'text-orange-400' : 'text-gray-600'}
          />
          <StatCard
            icon={<Zap size={14} />}
            label="Total XP"
            value={xp.toLocaleString()}
            sub="experience"
          />
          <StatCard
            icon={<Trophy size={14} />}
            label="Sessions"
            value={sessions}
            sub="completed"
            accent="text-purple-400"
          />
        </div>

        {/* Badges */}
        <BadgeGrid earned={badges} />

        {/* Recent sessions */}
        <RecentSessions sessions={sessionHistory} />
      </div>
    </div>
  )
}
