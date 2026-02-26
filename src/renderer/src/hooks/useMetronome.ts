import { useState, useRef, useCallback, useEffect } from 'react'

interface MetronomeState {
  bpm: number
  isPlaying: boolean
  currentBeat: number
  beatsPerMeasure: number
  volume: number
  accentFirstBeat: boolean
}

interface MetronomeControls {
  setBpm: (bpm: number) => void
  setBeatsPerMeasure: (beats: number) => void
  setVolume: (vol: number) => void
  setAccentFirstBeat: (accent: boolean) => void
  start: () => void
  stop: () => void
  toggle: () => void
}

export function useMetronome(): MetronomeState & MetronomeControls {
  const [bpm, setBpmState] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(4)
  const [volume, setVolumeState] = useState(0.7)
  const [accentFirstBeat, setAccentFirstBeatState] = useState(true)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const bpmRef = useRef(bpm)
  const beatsPerMeasureRef = useRef(beatsPerMeasure)
  const volumeRef = useRef(volume)
  const accentRef = useRef(accentFirstBeat)
  const schedulerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlayingRef = useRef(false)

  // Keep refs in sync
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsPerMeasureRef.current = beatsPerMeasure }, [beatsPerMeasure])
  useEffect(() => { volumeRef.current = volume }, [volume])
  useEffect(() => { accentRef.current = accentFirstBeat }, [accentFirstBeat])

  const scheduleClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = audioCtxRef.current!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.value = isAccent ? 1200 : 800

    const vol = volumeRef.current
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(vol * 0.8, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

    osc.start(time)
    osc.stop(time + 0.1)
  }, [])

  const scheduler = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return

    const ctx = audioCtxRef.current
    const scheduleAhead = 0.12 // 120ms lookahead

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAhead) {
      const isAccent = accentRef.current && currentBeatRef.current === 0
      scheduleClick(nextNoteTimeRef.current, isAccent)

      setCurrentBeat(currentBeatRef.current)
      const secondsPerBeat = 60.0 / bpmRef.current
      nextNoteTimeRef.current += secondsPerBeat
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current
    }

    schedulerTimerRef.current = setTimeout(scheduler, 25)
  }, [scheduleClick])

  const start = useCallback(() => {
    if (isPlayingRef.current) return
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    isPlayingRef.current = true
    currentBeatRef.current = 0
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05
    setIsPlaying(true)
    scheduler()
  }, [scheduler])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current)
    setIsPlaying(false)
    setCurrentBeat(0)
    currentBeatRef.current = 0
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) stop()
    else start()
  }, [start, stop])

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(20, Math.min(300, newBpm))
    setBpmState(clamped)
  }, [])

  const setBeatsPerMeasure = useCallback((beats: number) => {
    setBeatsPerMeasureState(beats)
    currentBeatRef.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      if (schedulerTimerRef.current) clearTimeout(schedulerTimerRef.current)
    }
  }, [])

  return {
    bpm,
    isPlaying,
    currentBeat,
    beatsPerMeasure,
    volume,
    accentFirstBeat,
    setBpm,
    setBeatsPerMeasure,
    setVolume: setVolumeState,
    setAccentFirstBeat: setAccentFirstBeatState,
    start,
    stop,
    toggle
  }
}
