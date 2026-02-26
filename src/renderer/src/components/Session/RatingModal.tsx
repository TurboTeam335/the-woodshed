import { useState } from 'react'
import { Star } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useStore } from '../../stores/useStore'

interface RatingModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: () => void
}

const STAR_LABELS = ['', 'Rough session', 'Below expectations', 'Solid session', 'Great session', 'Peak performance']

export default function RatingModal({ open, onClose, onSubmit }: RatingModalProps): JSX.Element {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { submitRating } = useStore()

  const display = hovered || rating

  const handleSubmit = async () => {
    if (!rating) return
    setIsSubmitting(true)
    await submitRating(rating, note.trim() || undefined)
    setIsSubmitting(false)
    setRating(0)
    setNote('')
    onSubmit?.()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rate Today's Session"
      persistent
      className="max-w-md"
    >
      <div className="space-y-5">
        <p className="text-sm text-gray-400">
          Your rating shapes the next session. Be honest — it only helps.
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={36}
                className={[
                  'transition-colors',
                  star <= display
                    ? 'text-brand-400 fill-brand-400'
                    : 'text-surface-600'
                ].join(' ')}
              />
            </button>
          ))}
        </div>

        {/* Star label */}
        <div className="text-center">
          <span className={`text-sm font-medium ${rating ? 'text-gray-200' : 'text-gray-600'}`}>
            {display ? STAR_LABELS[display] : 'Select a rating'}
          </span>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">
            Note (optional) — what worked? what didn't?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. 'technique block was too easy', 'improv clicked today', 'need more groove work'"
            rows={3}
            className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 resize-none focus:outline-none focus:border-brand-500/50 transition-colors"
            data-selectable
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="flex-1"
          >
            Later
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!rating}
            className="flex-1"
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </Modal>
  )
}
