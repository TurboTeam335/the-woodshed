import type { Session } from '../../../../shared/types'
import { CheckCircle2, Clock, Star } from 'lucide-react'

interface RecentSessionsProps {
  sessions: Session[]
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-green-400',
  active: 'text-brand-400',
  pending: 'text-gray-600'
}

const STATUS_ICONS: Record<string, JSX.Element> = {
  completed: <CheckCircle2 size={13} />,
  active: <Clock size={13} />,
  pending: <Clock size={13} />
}

function StarRating({ rating }: { rating?: number }): JSX.Element | null {
  if (!rating) return null
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= rating ? 'text-brand-400 fill-brand-400' : 'text-surface-600'}
        />
      ))}
    </div>
  )
}

export function RecentSessions({ sessions }: RecentSessionsProps): JSX.Element {
  if (sessions.length === 0) {
    return (
      <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recent Sessions
        </h3>
        <p className="text-sm text-gray-600">No sessions yet. Generate your first one!</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Recent Sessions
      </h3>
      <div className="space-y-2">
        {sessions.slice(0, 7).map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between py-2 border-b border-surface-700 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={STATUS_COLORS[session.status]}>
                  {STATUS_ICONS[session.status]}
                </span>
                <span className="text-xs font-medium text-gray-300 truncate">
                  {session.title}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-600">
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {session.xpEarned != null && (
                  <span className="text-xs text-brand-500">+{session.xpEarned} XP</span>
                )}
                {session.ratingNote && (
                  <span className="text-xs text-gray-600 italic truncate max-w-[140px]">
                    "{session.ratingNote}"
                  </span>
                )}
              </div>
            </div>
            <div className="ml-2 flex-shrink-0">
              <StarRating rating={session.rating} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
