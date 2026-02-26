import { useState } from 'react'
import type { SessionBlock } from '../../../../shared/types'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, Star } from 'lucide-react'
import TimerDisplay from './TimerDisplay'
import NotationDisplay from './NotationDisplay'
import { useStore } from '../../stores/useStore'

const BLOCK_COLORS: Record<string, string> = {
  technique:     'border-blue-500/50 bg-blue-500/5',
  rhythm:        'border-orange-500/50 bg-orange-500/5',
  improvisation: 'border-purple-500/50 bg-purple-500/5',
  theory:        'border-yellow-500/50 bg-yellow-500/5',
  ear_training:  'border-teal-500/50 bg-teal-500/5',
  composition:   'border-green-500/50 bg-green-500/5',
  creative:      'border-pink-500/50 bg-pink-500/5'
}

const BLOCK_ACCENT: Record<string, string> = {
  technique:     'text-blue-400',
  rhythm:        'text-orange-400',
  improvisation: 'text-purple-400',
  theory:        'text-yellow-400',
  ear_training:  'text-teal-400',
  composition:   'text-green-400',
  creative:      'text-pink-400'
}

const BLOCK_ICONS: Record<string, string> = {
  technique:     '🎸',
  rhythm:        '🥁',
  improvisation: '🎵',
  theory:        '📚',
  ear_training:  '👂',
  composition:   '✍️',
  creative:      '⭐'
}

interface BlockCardProps {
  block: SessionBlock
  isCompleted: boolean
  sessionId: number
}

export default function BlockCard({ block, isCompleted, sessionId }: BlockCardProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const { completeBlock, uncompleteBlock } = useStore()

  const colorClass = BLOCK_COLORS[block.type] ?? 'border-surface-600 bg-surface-800'
  const accentClass = BLOCK_ACCENT[block.type] ?? 'text-gray-400'
  const icon = BLOCK_ICONS[block.type] ?? '🎵'

  const handleToggleComplete = async () => {
    if (isCompleted) {
      await uncompleteBlock(block.id)
    } else {
      await completeBlock(block.id)
    }
  }

  // Use a data attribute + inline style approach so Tailwind JIT isn't needed for dynamic colors
  const difficultyBars = Array.from({ length: 10 }).map((_, i) => (
    <div
      key={i}
      className="w-1 h-2.5 rounded-sm"
      style={i < block.difficulty
        ? { backgroundColor: 'currentColor', opacity: 0.7 }
        : { backgroundColor: '#3a3a3a' }
      }
    />
  ))

  return (
    <div
      className={[
        'border rounded-xl transition-all duration-200',
        colorClass,
        isCompleted ? 'opacity-70' : ''
      ].join(' ')}
    >
      {/* Header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Complete toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleComplete() }}
          className={[
            'mt-0.5 flex-shrink-0 transition-colors',
            isCompleted ? accentClass : 'text-gray-600 hover:text-gray-400'
          ].join(' ')}
          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        >
          {isCompleted
            ? <CheckCircle2 size={20} />
            : <Circle size={20} />
          }
        </button>

        {/* Block info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{icon}</span>
            <span className={`text-xs font-semibold uppercase tracking-wide ${accentClass}`}>
              {block.type.replace('_', ' ')}
            </span>
            {block.isOptional && (
              <span className="text-xs text-gray-600 border border-surface-600 px-1.5 py-0.5 rounded">
                optional
              </span>
            )}
          </div>
          <h3 className={`text-sm font-semibold mt-0.5 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-100'}`}>
            {block.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              <span>{block.durationMinutes}m</span>
            </div>
            <div className="flex items-center gap-0.5" title={`Difficulty: ${block.difficulty}/10`}>
              {difficultyBars}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star size={11} />
              <span>{block.xpValue} XP</span>
            </div>
          </div>
        </div>

        {/* Expand caret */}
        <button className="text-gray-600 hover:text-gray-400 transition-colors mt-1">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-surface-700/50 pt-4">
          {/* Instructions */}
          <p className="text-sm text-gray-300 leading-relaxed" data-selectable>
            {block.instructions}
          </p>

          {/* Timer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
            >
              {showTimer ? 'Hide timer' : 'Show timer'}
            </button>
          </div>

          {showTimer && (
            <div className="flex justify-center py-2">
              <TimerDisplay durationMinutes={block.durationMinutes} />
            </div>
          )}

          {/* Exercises */}
          {block.exercises.map((exercise) => (
            <div key={exercise.id} className="space-y-2">
              <div className="bg-surface-900/60 border border-surface-700 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-200 mb-1.5" data-selectable>
                  {exercise.title}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap" data-selectable>
                  {exercise.description}
                </p>
              </div>

              {exercise.notation && (
                <NotationDisplay notation={exercise.notation} title="Notation" />
              )}
            </div>
          ))}

          {/* Complete block button */}
          {!isCompleted && (
            <button
              onClick={handleToggleComplete}
              className={`w-full py-2 text-sm font-semibold rounded-lg transition-colors mt-2 bg-white/5 hover:bg-white/10 border border-white/10 ${accentClass}`}
            >
              Mark Block Complete (+{block.xpValue} XP)
            </button>
          )}

          {isCompleted && (
            <div className={`flex items-center gap-2 text-sm font-medium ${accentClass}`}>
              <CheckCircle2 size={16} />
              <span>Block completed</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
