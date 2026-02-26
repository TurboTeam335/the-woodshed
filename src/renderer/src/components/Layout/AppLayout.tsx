import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import { useStore } from '../../stores/useStore'
import { Modal } from '../ui/Modal'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const { newBadges, clearNewBadges, isLoaded } = useStore()

  // Auto-clear badge notifications after a delay
  useEffect(() => {
    if (newBadges.length === 0) return
    const timeout = setTimeout(clearNewBadges, 6000)
    return () => clearTimeout(timeout)
  }, [newBadges, clearNewBadges])

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4 text-gray-600">
          <span className="text-4xl animate-pulse">🎸</span>
          <span className="text-sm">Loading The Woodshed...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex bg-surface-950 text-gray-200">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>

      {/* New badge celebration */}
      <Modal
        open={newBadges.length > 0}
        onClose={clearNewBadges}
        title="Badge Unlocked!"
        className="max-w-sm"
      >
        <div className="flex flex-col gap-4">
          {newBadges.map((badge) => (
            <div key={badge.id} className="flex items-start gap-4">
              <span className="text-4xl">{badge.icon}</span>
              <div>
                <div className="font-semibold text-gray-100">{badge.name}</div>
                <div className="text-sm text-gray-400 mt-0.5">{badge.description}</div>
              </div>
            </div>
          ))}
          <button
            onClick={clearNewBadges}
            className="mt-2 w-full py-2 bg-brand-500 hover:bg-brand-400 text-black font-semibold rounded-lg transition-colors text-sm"
          >
            Keep Going
          </button>
        </div>
      </Modal>
    </div>
  )
}
