'use client'

import { useEffect } from 'react'
import { X, type LucideIcon } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  title: string
  subtitle?: string
  icon?: LucideIcon
  onClose: () => void
  children: React.ReactNode
  webApp?: {
    BackButton?: {
      show: () => void
      hide: () => void
      onClick: (callback: () => void) => void
      offClick: (callback: () => void) => void
    }
  } | null
}

export function BottomSheet({
  open,
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  webApp,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) {
      webApp?.BackButton?.hide()
      return
    }

    const backButton = webApp?.BackButton
    const onTelegramBack = () => onClose()
    backButton?.onClick(onTelegramBack)
    backButton?.show()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      backButton?.offClick(onTelegramBack)
      backButton?.hide()
    }
  }, [open, onClose, webApp])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-md duration-200 animate-in fade-in"
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border border-border bg-card shadow-2xl duration-300 ease-out animate-in slide-in-from-bottom-4 fade-in sm:rounded-[28px] sm:duration-200 sm:zoom-in-95">
        {/* drag handle (mobile only) */}
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <span className="h-1.5 w-10 rounded-full bg-muted-foreground/25" aria-hidden="true" />
        </div>

        {/* sticky header */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-4">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Icon className="size-[18px] text-accent" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="text-[17px] font-semibold leading-tight tracking-tight text-balance">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[13px] leading-tight text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}
