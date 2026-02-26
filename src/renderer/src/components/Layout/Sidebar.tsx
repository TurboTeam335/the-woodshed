import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Guitar, BarChart3, Settings, Zap, Flame } from 'lucide-react'
import { useStore } from '../../stores/useStore'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

function NavItem({ to, icon, label }: NavItemProps): JSX.Element {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
          isActive
            ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
            : 'text-gray-500 hover:text-gray-300 hover:bg-surface-700'
        ].join(' ')
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar(): JSX.Element {
  const { gamification, todaySession } = useStore()

  const streak = gamification?.currentStreak ?? 0
  const xp = gamification?.totalXp ?? 0

  const sessionStatus = todaySession?.status

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col bg-surface-900 border-r border-surface-700 h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-700">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎸</span>
          <div>
            <div className="text-sm font-bold text-gray-100 leading-tight">The Woodshed</div>
            <div className="text-xs text-gray-600 leading-tight">Daily Practice Coach</div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-3 py-3 border-b border-surface-700 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Flame size={13} className={streak > 0 ? 'text-orange-400' : 'text-gray-600'} />
          <span className={streak > 0 ? 'text-gray-300 font-medium' : 'text-gray-600'}>
            {streak}d
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Zap size={13} className="text-brand-400" />
          <span className="text-gray-300 font-medium">{xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1">
        <NavItem
          to="/"
          icon={<LayoutDashboard size={16} />}
          label="Dashboard"
        />
        <NavItem
          to="/session"
          icon={
            <span className="relative">
              <Guitar size={16} />
              {sessionStatus === 'active' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-400 rounded-full" />
              )}
            </span>
          }
          label="Today's Session"
        />
        <NavItem
          to="/progress"
          icon={<BarChart3 size={16} />}
          label="Progress"
        />
      </nav>

      {/* Settings at bottom */}
      <div className="px-2 pb-3 border-t border-surface-700 pt-3">
        <NavItem
          to="/settings"
          icon={<Settings size={16} />}
          label="Settings"
        />
      </div>
    </aside>
  )
}
