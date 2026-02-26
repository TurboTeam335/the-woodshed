import { useState } from 'react'
import { Play, Square, Minus, Plus, Music } from 'lucide-react'
import { useMetronome } from '../../hooks/useMetronome'

const TIME_SIGNATURES = [
  { beats: 2, label: '2/4' },
  { beats: 3, label: '3/4' },
  { beats: 4, label: '4/4' },
  { beats: 6, label: '6/8' }
]

const TEMPO_PRESETS = [60, 80, 100, 120, 140, 160]

export default function MetronomeControl(): JSX.Element {
  const metro = useMetronome()
  const [showPresets, setShowPresets] = useState(false)

  const adjustBpm = (delta: number) => metro.setBpm(metro.bpm + delta)

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Music size={14} className="text-brand-400" />
        <span className="text-sm font-semibold text-gray-200">Metronome</span>
      </div>

      {/* BPM control */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => adjustBpm(-5)}
          className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Minus size={14} />
        </button>

        <div className="flex-1 mx-3 text-center">
          <div className="relative">
            <input
              type="number"
              value={metro.bpm}
              onChange={(e) => metro.setBpm(parseInt(e.target.value) || 100)}
              className="w-20 text-center text-2xl font-mono font-bold bg-transparent text-gray-100 border-none outline-none"
              min={20}
              max={300}
            />
          </div>
          <div className="text-xs text-gray-600 mt-0.5">BPM</div>
        </div>

        <button
          onClick={() => adjustBpm(5)}
          className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* BPM slider */}
      <input
        type="range"
        min={20}
        max={300}
        step={1}
        value={metro.bpm}
        onChange={(e) => metro.setBpm(parseInt(e.target.value))}
        className="w-full mb-4"
      />

      {/* Beat indicator */}
      <div className="flex justify-center gap-1.5 mb-4">
        {Array.from({ length: metro.beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={[
              'w-2.5 h-2.5 rounded-full transition-all duration-75',
              metro.isPlaying && metro.currentBeat === i
                ? i === 0
                  ? 'bg-brand-400 scale-125'
                  : 'bg-surface-400 scale-110'
                : 'bg-surface-600'
            ].join(' ')}
          />
        ))}
      </div>

      {/* Time signature */}
      <div className="flex gap-1.5 mb-4">
        {TIME_SIGNATURES.map((ts) => (
          <button
            key={ts.beats}
            onClick={() => metro.setBeatsPerMeasure(ts.beats)}
            className={[
              'flex-1 py-1 text-xs rounded-md transition-colors',
              metro.beatsPerMeasure === ts.beats
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                : 'bg-surface-700 text-gray-500 hover:text-gray-300 border border-transparent'
            ].join(' ')}
          >
            {ts.label}
          </button>
        ))}
      </div>

      {/* Preset tempos */}
      <div className="mb-4">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Presets {showPresets ? '▲' : '▼'}
        </button>
        {showPresets && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TEMPO_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => metro.setBpm(preset)}
                className="px-2 py-1 text-xs rounded bg-surface-700 hover:bg-surface-600 text-gray-400 hover:text-gray-200 transition-colors font-mono"
              >
                {preset}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-600 w-12">Vol</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={metro.volume}
          onChange={(e) => metro.setVolume(parseFloat(e.target.value))}
          className="flex-1"
        />
      </div>

      {/* Play/stop */}
      <button
        onClick={metro.toggle}
        className={[
          'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2',
          metro.isPlaying
            ? 'bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-900/50'
            : 'bg-brand-500 hover:bg-brand-400 text-black'
        ].join(' ')}
      >
        {metro.isPlaying ? (
          <>
            <Square size={14} fill="currentColor" />
            Stop
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" />
            Start
          </>
        )}
      </button>
    </div>
  )
}
