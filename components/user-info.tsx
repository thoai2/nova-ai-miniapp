'use client'

import { useState } from 'react'
import { Send, BadgeCheck, ChevronRight } from 'lucide-react'
import { hapticTap, type TelegramUser } from '@/lib/telegram'

interface UserInfoProps {
  user: TelegramUser | null
  isTelegram: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webApp: any
}

export function UserInfo({ user, isTelegram, webApp }: UserInfoProps) {
  const [shown, setShown] = useState(false)

  const fullName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ')
    : ''
  const initials = user ? user.first_name.charAt(0).toUpperCase() : '?'

  // Resolved profile — shown once the user taps and Telegram returns data.
  if (shown && user) {
    return (
      <section className="flex items-center gap-3.5 rounded-3xl border border-border bg-card p-3.5 duration-300 animate-in fade-in">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-base font-semibold text-foreground">
          {user.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photo_url || '/placeholder.svg'}
              alt={fullName}
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[15px] font-semibold tracking-tight">
              {fullName}
            </p>
            {user.is_premium && (
              <BadgeCheck className="size-4 shrink-0 text-accent" />
            )}
          </div>
          <p className="truncate text-[13px] text-muted-foreground">
            {user.username ? `@${user.username}` : `ID ${user.id}`}
            {user.language_code ? ` · ${user.language_code.toUpperCase()}` : ''}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Connected
        </span>
      </section>
    )
  }

  // Default account/context card with the primary action.
  return (
    <section className="flex items-center gap-3.5 rounded-3xl border border-border bg-card p-3.5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Send className="size-5 text-accent" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-tight">Telegram</p>
        <p className="truncate text-[13px] text-muted-foreground">
          {shown && !user
            ? isTelegram
              ? 'Reopen from Telegram to load data'
              : 'Open inside Telegram to connect'
            : 'Connect your account'}
        </p>
      </div>
      <button
        onClick={() => {
          hapticTap(webApp)
          setShown(true)
        }}
        className="flex shrink-0 items-center gap-1 rounded-full bg-primary py-2 pl-3.5 pr-3 text-[13px] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
      >
        Get info
        <ChevronRight className="size-4" />
      </button>
    </section>
  )
}
