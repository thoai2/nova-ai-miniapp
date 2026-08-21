'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Check, ChevronDown, Copy, RefreshCw } from 'lucide-react'

/* ---------- shared bits ---------- */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'h-12 w-full rounded-xl border border-input bg-secondary/60 px-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-accent/60 focus:bg-secondary focus:ring-2 focus:ring-ring/30'

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div
      key={value}
      className="rounded-2xl border border-border bg-secondary/50 px-4 py-3.5 duration-200 animate-in fade-in slide-in-from-bottom-1"
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

const primaryBtn =
  'flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform active:scale-[0.98]'

/* ---------- 1. Currency converter ---------- */

type CurrencyMeta = { code: string; name: string; perUSD: number }

// Static fallback rates relative to 1 USD (no live API in this iteration).
const CURRENCIES: CurrencyMeta[] = [
  { code: 'USD', name: 'United States Dollar', perUSD: 1 },
  { code: 'EUR', name: 'Euro', perUSD: 0.924 },
  { code: 'GBP', name: 'British Pound', perUSD: 0.79 },
  { code: 'CHF', name: 'Swiss Franc', perUSD: 0.885 },
  { code: 'CAD', name: 'Canadian Dollar', perUSD: 1.37 },
  { code: 'AUD', name: 'Australian Dollar', perUSD: 1.52 },
  { code: 'JPY', name: 'Japanese Yen', perUSD: 156.4 },
]

const currencyByCode = (code: string) =>
  CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(value)
}

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000]

/* Compact currency selector card that opens an in-sheet menu. */
function CurrencySelect({
  label,
  value,
  exclude,
  onChange,
}: {
  label: string
  value: string
  exclude?: string
  onChange: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = currencyByCode(value)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full flex-col items-start gap-1 rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-left transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/40"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="flex w-full items-center justify-between gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {active.code}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
        <span className="line-clamp-1 text-[12px] text-muted-foreground">
          {active.name}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-2xl shadow-black/50 duration-150 animate-in fade-in zoom-in-95">
          {CURRENCIES.map((c) => {
            const disabled = c.code === exclude
            const isActive = c.code === value
            return (
              <button
                key={c.code}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChange(c.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                  isActive ? 'bg-accent/15' : 'hover:bg-secondary'
                }`}
              >
                <span className="flex flex-col">
                  <span
                    className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-foreground'}`}
                  >
                    {c.code}
                  </span>
                  <span className="line-clamp-1 text-[11px] text-muted-foreground">
                    {c.name}
                  </span>
                </span>
                {isActive && <Check className="size-4 shrink-0 text-accent" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CurrencyTool() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [spin, setSpin] = useState(false)

  const fromMeta = currencyByCode(from)
  const toMeta = currencyByCode(to)
  const amountNum = Number(amount) || 0

  // Convert through USD using the static fallback rates.
  const unitRate = toMeta.perUSD / fromMeta.perUSD
  const converted = amountNum * unitRate

  const swap = () => {
    setSpin(true)
    setFrom(to)
    setTo(from)
    setTimeout(() => setSpin(false), 300)
  }

  return (
    <div className="space-y-5">
      {/* Amount */}
      <div>
        <span className="mb-2 block text-[13px] font-medium text-muted-foreground">
          Amount
        </span>
        <div className="flex items-baseline gap-2 rounded-2xl border border-input bg-secondary/50 px-4 py-3.5 transition-all focus-within:border-accent/60 focus-within:bg-secondary focus-within:ring-2 focus-within:ring-ring/30">
          <span className="text-xl font-medium text-muted-foreground">
            {fromMeta.code}
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            placeholder="0.00"
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v)
            }}
            className="w-full min-w-0 bg-transparent text-right text-3xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40 tabular-nums"
          />
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_AMOUNTS.map((q) => {
          const isActive = amountNum === q
          return (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'border-accent/40 bg-accent/15 text-accent'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              ${q.toLocaleString('en-US')}
            </button>
          )
        })}
      </div>

      {/* Selectors + swap */}
      <div className="relative grid grid-cols-2 gap-3">
        <CurrencySelect label="From" value={from} exclude={to} onChange={setFrom} />
        <CurrencySelect label="To" value={to} exclude={from} onChange={setTo} />
        <button
          type="button"
          aria-label="Swap currencies"
          onClick={swap}
          className="absolute left-1/2 top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg shadow-black/40 transition-transform active:scale-90"
        >
          <ArrowUpDown
            className={`size-4 transition-transform duration-300 ${spin ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Result */}
      <div
        key={`${converted}-${to}`}
        className="rounded-2xl border border-accent/20 bg-accent/[0.07] px-5 py-5 text-center duration-200 animate-in fade-in slide-in-from-bottom-1"
      >
        <p className="text-[13px] font-medium text-muted-foreground tabular-nums">
          {formatMoney(amountNum, from)}
        </p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground tabular-nums">
          {formatMoney(converted, to)}
        </p>
        <p className="mt-3 text-[12px] text-muted-foreground tabular-nums">
          {`1 ${from} = ${unitRate.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}`}
        </p>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() => {
          setAmount('100')
          setFrom('USD')
          setTo('EUR')
        }}
        className="w-full rounded-xl border border-border bg-secondary/40 py-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:scale-[0.99]"
      >
        Reset
      </button>
    </div>
  )
}

/* ---------- 2. BMI calculator ---------- */

export function BmiTool() {
  const [weight, setWeight] = useState('70')
  const [height, setHeight] = useState('175')
  const bmi = useMemo(() => {
    const h = (Number(height) || 0) / 100
    if (!h) return 0
    return (Number(weight) || 0) / (h * h)
  }, [weight, height])

  const category = useMemo(() => {
    if (!bmi) return '—'
    if (bmi < 18.5) return 'Underweight'
    if (bmi < 25) return 'Normal'
    if (bmi < 30) return 'Overweight'
    return 'Obese'
  }, [bmi])

  return (
    <div className="space-y-4">
      <Field label="Weight (kg)">
        <input
          type="number"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Height (cm)">
        <input
          type="number"
          inputMode="decimal"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Result label="BMI" value={bmi ? bmi.toFixed(1) : '—'} />
        <Result label="Category" value={category} />
      </div>
    </div>
  )
}

/* ---------- 3. Tip & percentage ---------- */

export function PercentTool() {
  const [amount, setAmount] = useState('50')
  const [percent, setPercent] = useState('18')
  const p = (Number(amount) || 0) * ((Number(percent) || 0) / 100)
  const total = (Number(amount) || 0) + p
  return (
    <div className="space-y-4">
      <Field label="Amount (USD)">
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Percentage (%)">
        <input
          type="number"
          inputMode="decimal"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Result label="Tip / Percent" value={formatMoney(p, 'USD')} />
        <Result label="Total" value={formatMoney(total, 'USD')} />
      </div>
    </div>
  )
}

/* ---------- 4. Length unit converter ---------- */

const units: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  inch: 0.0254,
  ft: 0.3048,
  mile: 1609.344,
}

export function UnitTool() {
  const [value, setValue] = useState('1')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('ft')
  const result = ((Number(value) || 0) * units[from]) / units[to]
  return (
    <div className="space-y-4">
      <Field label="Value">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          >
            {Object.keys(units).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
        <Field label="To">
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          >
            {Object.keys(units).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Result
        label="Result"
        value={`${result.toLocaleString('en-US', { maximumFractionDigits: 4 })} ${to}`}
      />
    </div>
  )
}

/* ---------- 5. QR code generator ---------- */

export function QrTool() {
  const [text, setText] = useState('https://telegram.org')
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    text || ' ',
  )}`
  return (
    <div className="space-y-4">
      <Field label="Text or link">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={inputClass}
        />
      </Field>
      <div className="flex justify-center rounded-2xl border border-border bg-secondary/50 p-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src || '/placeholder.svg'}
          alt="Generated QR code"
          width={220}
          height={220}
          crossOrigin="anonymous"
          className="rounded-xl bg-white duration-200 animate-in fade-in"
        />
      </div>
    </div>
  )
}

/* ---------- 6. Password generator ---------- */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*'

function makePassword(length: number) {
  let out = ''
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  for (let i = 0; i < length; i++) out += CHARS[arr[i] % CHARS.length]
  return out
}

export function PasswordTool() {
  const [length, setLength] = useState(14)
  const [password, setPassword] = useState(() => makePassword(14))
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setPassword(makePassword(length))
    setCopied(false)
  }

  const copy = async () => {
    if (!password) return
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="space-y-4">
      <Field label={`Length · ${length} characters`}>
        <input
          type="range"
          min={6}
          max={32}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-[var(--accent)]"
        />
      </Field>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-3">
        <code className="flex-1 break-all font-mono text-[15px] text-foreground">
          {password}
        </code>
        <button
          aria-label="Copy password"
          onClick={copy}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground transition-colors hover:text-accent active:scale-95"
        >
          {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
        </button>
      </div>
      <button onClick={generate} className={primaryBtn}>
        <RefreshCw className="size-4" />
        Generate new password
      </button>
    </div>
  )
}
