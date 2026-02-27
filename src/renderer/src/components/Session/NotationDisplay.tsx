import { useEffect, useRef, useState } from 'react'
import type { ExerciseNotation } from '../../../../shared/types'
import { notationToAlphaTex, validateNotation } from '../../lib/notationUtils'

interface NotationDisplayProps {
  notation: ExerciseNotation
  title?: string
}

declare global {
  interface Window {
    alphaTab?: unknown
  }
}

// Dynamically load alphaTab to avoid Vite bundling issues with the Web Worker
let alphaTabPromise: Promise<typeof import('@coderline/alphatab')> | null = null

async function loadAlphaTab() {
  if (!alphaTabPromise) {
    alphaTabPromise = import('@coderline/alphatab')
  }
  return alphaTabPromise
}

export default function NotationDisplay({ notation, title }: NotationDisplayProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!containerRef.current) return
    if (!validateNotation(notation)) {
      setError('Notation data appears malformed.')
      setIsLoading(false)
      return
    }

    let destroyed = false

    // Fallback timeout — if alphaTab hasn't finished in 12s, show text fallback
    const timeout = setTimeout(() => {
      if (!destroyed) {
        setError('Notation renderer timed out.')
        setIsLoading(false)
      }
    }, 12000)

    loadAlphaTab()
      .then((at) => {
        if (destroyed || !containerRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const atAny = at as any
        const Settings = atAny.Settings ?? atAny.default?.Settings
        const AlphaTabApi = atAny.AlphaTabApi ?? atAny.default?.AlphaTabApi

        if (!Settings || !AlphaTabApi) {
          setError('alphaTab library failed to load.')
          setIsLoading(false)
          return
        }

        const settings = new Settings()
        // Fonts from CDN; disable web worker to avoid Electron worker-loading issues
        const cdnBase = 'https://cdn.jsdelivr.net/npm/@coderline/alphatab@latest/dist/'
        settings.core.fontDirectory = `${cdnBase}font/`
        settings.core.useWorkers = false  // render in main thread — no CDN worker needed
        settings.display.scale = 0.9
        settings.display.layoutMode = 1 // Horizontal

        const api = new AlphaTabApi(containerRef.current, settings)
        apiRef.current = api

        api.renderStarted.on(() => setIsLoading(true))
        api.renderFinished.on(() => {
          clearTimeout(timeout)
          setIsLoading(false)
        })
        api.error.on((e: unknown) => {
          clearTimeout(timeout)
          const msg = e instanceof Error ? e.message : String(e)
          setError(`Render error: ${msg}`)
          setIsLoading(false)
        })

        const tex = notationToAlphaTex(notation)
        api.tex(tex, [0])
      })
      .catch((err) => {
        clearTimeout(timeout)
        if (!destroyed) {
          setError(`Failed to load notation renderer: ${err.message}`)
          setIsLoading(false)
        }
      })

    return () => {
      destroyed = true
      clearTimeout(timeout)
      if (apiRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(apiRef.current as any).destroy?.()
        } catch {}
        apiRef.current = null
      }
    }
  }, [notation])

  if (error) {
    // Graceful fallback: show notation notes as text
    return (
      <div className="bg-surface-900/50 border border-surface-700 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">Notation unavailable</p>
        {notation.notes && (
          <p className="text-sm text-gray-400 italic">{notation.notes}</p>
        )}
      </div>
    )
  }

  return (
    <div className="notation-wrapper">
      {title && (
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      )}
      <div className="relative bg-white rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-800 z-10">
            <span className="text-xs text-gray-500 animate-pulse">Loading notation...</span>
          </div>
        )}
        <div ref={containerRef} className="min-h-[120px]" />
      </div>
      {notation.notes && (
        <p className="text-xs text-gray-500 italic mt-2">{notation.notes}</p>
      )}
    </div>
  )
}
