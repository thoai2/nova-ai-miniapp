'use client'

import { useState, type ComponentType } from 'react'
import {
  Coins,
  HeartPulse,
  Percent,
  Ruler,
  QrCode,
  KeyRound,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { hapticTap, useTelegram } from '@/lib/telegram'
import { BottomSheet } from '@/components/bottom-sheet'
import { UserInfo } from '@/components/user-info'
import {
  CurrencyTool,
  BmiTool,
  PercentTool,
  UnitTool,
  QrTool,
  PasswordTool,
} from '@/components/tools'

interface Utility {
  id: string
  name: string
  desc: string
  icon: LucideIcon
  Tool: ComponentType
}

const utilities: Utility[] = [
  { id: 'currency', name: 'Currency', desc: 'Live-rate converter', icon: Coins, Tool: CurrencyTool },
  { id: 'bmi', name: 'BMI', desc: 'Body mass index', icon: HeartPulse, Tool: BmiTool },
  { id: 'percent', name: 'Tip & Percent', desc: 'Split and totals', icon: Percent, Tool: PercentTool },
  { id: 'unit', name: 'Units', desc: 'Length converter', icon: Ruler, Tool: UnitTool },
  { id: 'qr', name: 'QR Code', desc: 'Generate from text', icon: QrCode, Tool: QrTool },
  { id: 'password', name: 'Password', desc: 'Strong & random', icon: KeyRound, Tool: PasswordTool },
]

export function Home() {
  const { webApp, user, isTelegram } = useTelegram()
  const [active, setActive] = useState<Utility | null>(null)

  const ActiveTool = active?.Tool

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-[calc(env(safe-area-inset-top)+1.75rem)]">
      {/* subtle decorative glow behind the header */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-[90px]"
      />

      <header className="relative mb-7">
        <div className="mb-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3 text-accent" />
            {isTelegram ? 'Telegram Mini App' : 'Preview mode'}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" aria-hidden="true" />
            Live
          </span>
        </div>
        <h1 className="text-[2.75rem] font-bold leading-none tracking-tight text-balance">
          Toolkit
        </h1>
        <p className="mt-3 max-w-[15rem] text-[15px] leading-relaxed text-muted-foreground text-pretty">
          A fast, minimal set of everyday tools — right inside your chat.
        </p>
      </header>

      <div className="mb-7">
        <UserInfo user={user} isTelegram={isTelegram} webApp={webApp} />
      </div>

      <h2 className="mb-3 px-1 text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
        Tools
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {utilities.map((u) => {
          const Icon = u.icon
          return (
            <button
              key={u.id}
              onClick={() => {
                hapticTap(webApp)
                setActive(u)
              }}
              className="group flex h-full flex-col items-start rounded-3xl border border-border bg-card p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-card/80 active:scale-[0.98]"
            >
              <div className="mb-3.5 flex size-11 items-center justify-center rounded-full bg-secondary transition-colors group-hover:bg-accent/12">
                <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>
              <span className="flex w-full items-center justify-between gap-1 text-[15px] font-semibold tracking-tight">
                {u.name}
                <ChevronRight className="size-4 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </span>
              <span className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {u.desc}
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-auto pt-8 text-center text-[11px] text-muted-foreground/60">
        Built with v0 · Runs seamlessly in Telegram
      </p>

      <BottomSheet
        open={active !== null}
        title={active?.name ?? ''}
        subtitle={active?.desc}
        icon={active?.icon}
        onClose={() => setActive(null)}
        webApp={webApp}
      >
        {ActiveTool ? <ActiveTool /> : null}
      </BottomSheet>
    </main>
  )
}
