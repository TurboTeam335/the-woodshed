import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  children: ReactNode
  className?: string
  /** If true, clicking the backdrop does not close the modal */
  persistent?: boolean
}

export function Modal({ open, onClose, title, children, className = '', persistent = false }: ModalProps): JSX.Element | null {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && !persistent) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, persistent])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => !persistent && onClose?.()}
      />
      {/* Panel */}
      <div
        className={[
          'relative z-10 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl',
          'w-full max-w-lg mx-4 animate-slide-up',
          className
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between p-5 border-b border-surface-700">
            {title && <h2 className="text-lg font-semibold text-gray-100">{title}</h2>}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-surface-700 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
