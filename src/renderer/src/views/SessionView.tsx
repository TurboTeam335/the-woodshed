import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sliders } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Button } from '../components/ui/Button'
import BlockCard from '../components/Session/BlockCard'
import MetronomeControl from '../components/Session/MetronomeControl'
import RatingModal from '../components/Session/RatingModal'

export default function SessionView(): JSX.Element {
  const navigate = useNavigate()
  const {
    todaySession,
    hasApiKey,
    isGenerating,
    generateError,
    generateSession
  } = useStore()
  const [showMetronome, setShowMetronome] = useState(false)
  const [showRating, setShowRating] = useState(false)

  // ── No session state ──────────────────────────────────────────────────────
  if (!todaySession) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-surface-700 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-surface-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-semibold text-gray-200">Today's Session</h1>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col gap-5 p-6">
          <span className="text-5xl">🎸</span>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-200 mb-1">No session generated yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              {hasApiKey
                ? 'Generate today\'s personalized 60-minute session.'
                : 'Add your Anthropic API key in Settings to get started.'}
            </p>
          </div>
          {generateError && (
            <p className="text-sm text-red-400 max-w-sm text-center">{generateError}</p>
          )}
          {hasApiKey ? (
            <Button variant="primary" size="lg" loading={isGenerating} onClick={generateSession}>
              {isGenerating ? 'Building your session...' : 'Generate Today\'s Session'}
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={() => navigate('/settings')}>
              Configure API Key
            </Button>
          )}
        </div>
      </div>
    )
  }

  const session = todaySession
  const requiredBlocks = session.blocks.filter((b) => !b.isOptional)
  const completedRequired = requiredBlocks.filter((b) =>
    session.completedBlockIds.includes(b.id)
  ).length
  const allRequiredComplete = completedRequired === requiredBlocks.length
  const totalXpAvailable = session.blocks.reduce((sum, b) => sum + b.xpValue, 0)
  const sessionComplete = session.status === 'completed'

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="px-6 py-4 border-b border-surface-700 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="p-1.5 rounded-md text-gray-600 hover:text-gray-300 hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-gray-200 truncate">{session.title}</h1>
          <p className="text-xs text-gray-600">
            {completedRequired}/{requiredBlocks.length} required blocks
            {' · '}
            {totalXpAvailable} XP available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMetronome(!showMetronome)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              showMetronome
                ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                : 'bg-surface-700 text-gray-400 border-surface-600 hover:text-gray-200'
            ].join(' ')}
          >
            <Sliders size={12} />
            Metronome
          </button>
          {!sessionComplete && (
            <Button
              variant="primary"
              size="sm"
              disabled={!allRequiredComplete && session.completedBlockIds.length === 0}
              onClick={() => setShowRating(true)}
            >
              {allRequiredComplete ? 'Finish Session' : 'End Early'}
            </Button>
          )}
          {sessionComplete && (
            <span className="text-xs text-green-400 font-medium px-3 py-1.5 bg-green-900/20 border border-green-900/40 rounded-lg">
              ✓ Completed
            </span>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Blocks scroll area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* Coach message */}
          <div className="bg-surface-800 border border-brand-500/20 rounded-xl p-4">
            <p className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1.5">
              Coach's Note
            </p>
            <p className="text-sm text-gray-300 leading-relaxed" data--selectable>
              {session.coachMessage}
            </p>
          </div>

          {/* Completion banner */}
          {sessionComplete && (
            <div className="bg-green-900/20 border border-green-900/40 rounded-xl p-4 text-center animate-fade-in">
              <p className="text-green-400 font-semibold">Session Complete</p>
              <p className="text-sm text-gray-500 mt-1">
                Rated {session.rating}/5 stars · +{session.xpEarned} XP earned
              </p>
            </div>
          )}

          {/* Required blocks */}
          <div className="space-y-2">
            {session.blocks
              .filter((b) => !b.isOptional)
              .map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  isCompleted={session.completedBlockIds.includes(block.id)}
                  sessionId={session.id!}
                />
              ))}
          </div>

          {/* Optional / creative blocks */}
          {session.blocks.some((b) => b.isOptional) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <hr className="flex-1 border-surface-700" />
                <span className="text-xs text-gray-600 px-2">Bonus Challenge</span>
                <hr className="flex-1 border-surface-700" />
              </div>
              {session.blocks
                .filter((b) => b.isOptional)
                .map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    isCompleted={session.completedBlockIds.includes(block.id)}
                    sessionId={session.id!}
                  />
                ))}
            </div>
          )}

          {/* Finish session CTA at bottom if all required complete */}
          {!sessionComplete && allRequiredComplete && (
            <div className="bg-brand-500/10 border border-brand-500/25 rounded-xl p-4 text-center animate-fade-in">
              <p className="text-sm font-semibold text-brand-300 mb-1">All required blocks done!</p>
              <p className="text-xs text-gray-500 mb-3">Rate your session to bank the XP.</p>
              <Button variant="primary" onClick={() => setShowRating(true)}>
                Finish & Rate Session
              </Button>
            </div>
          )}

          {/* Bottom padding */}
          <div className="h-8" />
        </div>

        {/* Metronome panel */}
        {showMetronome && (
          <div className="w-56 flex-shrink-0 border-l border-surface-700 overflow-y-auto p-3">
            <MetronomeControl />
          </div>
        )}
      </div>

      {/* Rating modal */}
      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
      />
    </div>
  )
}
