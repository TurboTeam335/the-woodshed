import { useState, useEffect, useRef, useCallback } from 'react'

interface TimerState {
  totalSeconds: number
  elapsed: number
  remaining: number
  isRunning: boolean
  isFinished: boolean
  progress: number // 0–1
}

interface TimerControls {
  start: () => void
  pause: () => void
  reset: () => void
  toggle: () => void
}

export function useTimer(durationMinutes: number): TimerState & TimerControls {
  const totalSeconds = durationMinutes * 60
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const elapsedAtPauseRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    if (startTimeRef.current == null) return
    const now = performance.now()
    const delta = (now - startTimeRef.current) / 1000
    const newElapsed = Math.min(elapsedAtPauseRef.current + delta, totalSeconds)
    setElapsed(newElapsed)

    if (newElapsed < totalSeconds) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      setIsRunning(false)
    }
  }, [totalSeconds])

  const start = useCallback(() => {
    startTimeRef.current = performance.now()
    setIsRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    elapsedAtPauseRef.current = elapsed
    startTimeRef.current = null
    setIsRunning(false)
  }, [elapsed])

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null
    elapsedAtPauseRef.current = 0
    setElapsed(0)
    setIsRunning(false)
  }, [])

  const toggle = useCallback(() => {
    if (isRunning) pause()
    else start()
  }, [isRunning, start, pause])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const remaining = Math.max(0, totalSeconds - elapsed)
  const isFinished = elapsed >= totalSeconds

  return {
    totalSeconds,
    elapsed,
    remaining,
    isRunning,
    isFinished,
    progress: totalSeconds > 0 ? elapsed / totalSeconds : 0,
    start,
    pause,
    reset,
    toggle
  }
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
