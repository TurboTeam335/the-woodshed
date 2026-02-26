import type { ExerciseNotation, NoteBeat } from '../../../shared/types'

/**
 * Converts our internal notation JSON format to alphaTab's AlphaTex string.
 * AlphaTex reference: https://alphatab.net/docs/alphatex/
 *
 * String numbering: alphaTab uses 1=high e, 6=low E — matching our schema.
 * Duration: alphaTab uses the same numeric values (1, 2, 4, 8, 16).
 */
export function notationToAlphaTex(notation: ExerciseNotation): string {
  const lines: string[] = []

  if (notation.tempo) {
    lines.push(`\\tempo ${notation.tempo}`)
  }

  if (notation.timeSignature) {
    const parts = notation.timeSignature.split('/')
    if (parts.length === 2) {
      lines.push(`\\ts ${parts[0]} ${parts[1]}`)
    }
  }

  lines.push('.')

  const measureTexParts: string[] = []
  for (const measure of notation.measures) {
    const beatParts: string[] = []
    for (const beat of measure.beats) {
      beatParts.push(beatToAlphaTex(beat))
    }
    measureTexParts.push(beatParts.join(' '))
  }

  lines.push(measureTexParts.join(' | '))

  return lines.join('\n')
}

function beatToAlphaTex(beat: NoteBeat): string {
  if (beat.isRest) {
    return `:${beat.duration} r`
  }

  // Format: :duration fret.string{techniques}
  let tex = `:${beat.duration} ${beat.fret}.${beat.string}`

  const effects: string[] = []

  if (beat.technique === 'h') effects.push('h')
  if (beat.technique === 'p') effects.push('p')
  if (beat.technique === 's') effects.push('sl')
  if (beat.technique === 'b') effects.push('b(4 8 4)') // simple full bend and release
  if (beat.technique === 'v') effects.push('v')
  if (beat.accent) effects.push('ac')
  if (beat.ghostNote) effects.push('x')

  if (effects.length > 0) {
    tex += `{${effects.join(' ')}}`
  }

  return tex
}

/**
 * Validates that a notation object is structurally sound enough to render.
 */
export function validateNotation(notation: ExerciseNotation): boolean {
  try {
    if (!notation.measures || !Array.isArray(notation.measures)) return false
    for (const measure of notation.measures) {
      if (!measure.beats || !Array.isArray(measure.beats)) return false
      for (const beat of measure.beats) {
        if (beat.isRest) continue
        if (typeof beat.string !== 'number' || beat.string < 1 || beat.string > 6) return false
        if (typeof beat.fret !== 'number' || beat.fret < 0 || beat.fret > 24) return false
        if (![1, 2, 4, 8, 16].includes(beat.duration)) return false
      }
    }
    return true
  } catch {
    return false
  }
}
