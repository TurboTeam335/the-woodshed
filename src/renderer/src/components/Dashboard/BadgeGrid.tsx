import type { Badge } from '../../../../shared/types'
import { BADGE_DEFINITIONS } from '../../../../shared/types'

interface BadgeGridProps {
  earned: Badge[]
}

export function BadgeGrid({ earned }: BadgeGridProps): JSX.Element {
  const earnedIds = new Set(earned.map((b) => b.id))

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Badges
      </h3>
      <div className="flex flex-wrap gap-2">
        {BADGE_DEFINITIONS.map((def) => {
          const isEarned = earnedIds.has(def.id)
          const earnedBadge = earned.find((b) => b.id === def.id)
          return (
            <div
              key={def.id}
              title={isEarned ? `${def.name}: ${def.description}` : `Locked: ${def.description}`}
              className={[
                'group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-colors cursor-default',
                isEarned
                  ? 'bg-brand-500/10 border border-brand-500/25'
                  : 'bg-surface-900 border border-surface-700 opacity-40 grayscale'
              ].join(' ')}
            >
              <span className="text-2xl leading-none">{def.icon}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap max-w-[64px] truncate">
                {def.name}
              </span>
              {isEarned && earnedBadge && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-700 border border-surface-600 rounded text-xs text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                  {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
