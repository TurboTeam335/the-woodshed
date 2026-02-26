import { useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { useTimer, formatTime } from '../../hooks/useTimer'

interface TimerDisplayProps {
  durationMinutes: number
  onFinished?: () => void
}

const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function TimerDisplay({ durationMinutes, onFinished }: TimerDisplayProps): JSX.Element {
  const timer = useTimer(durationMinutes)

  // Notify parent once when timer reaches zero
  useEffect(() => {
    if (timer.isFinished) onFinished?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isFinished])

  const strokeDashoffset = CIRCUMFERENCE * (1 - timer.progress)
  const colorClass = timer.isFinished
    ? 'text-green-500'
    : timer.remaining < 60
    ? 'text-orange-400'
    : 'text-brand-500'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-surface-700"
          />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className={`${colorClass} transition-all duration-1000`}
          />
        </svg>
        {/* Time label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-mono font-bold ${colorClass}`}>
            {formatTime(timer.remaining)}
          </span>
          <span className="text-xs text-gray-600 mt-0.5">
            of {durationMinutes}m
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={timer.toggle}
          disabled={timer.isFinished}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-700 hover:bg-surface-600 text-gray-300 hover:text-gray-100 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {timer.isRunning ? <Pause size={12} /> : <Play size={12} />}
          {timer.isRunning ? 'Pause' : timer.elapsed > 0 ? 'Resume' : 'Start'}
        </button>
        {timer.elapsed > 0 && (
          <button
            onClick={timer.reset}
            className="p-1.5 rounded-md text-gray-600 hover:text-gray-400 hover:bg-surface-700 transition-colors"
            title="Reset timer"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {timer.isFinished && (
        <p className="text-xs text-green-500 font-medium animate-fade-in">
          Time's up — mark complete when ready
        </p>
      )}
    </div>
  )
}
