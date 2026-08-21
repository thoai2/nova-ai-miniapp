'use client'

import { useEffect, useState } from 'react'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  colorScheme: 'light' | 'dark'
  version: string
  platform: string
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
  }
  themeParams: Record<string, string>
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  disableVerticalSwipes?: () => void
  enableVerticalSwipes?: () => void
  BackButton?: {
    isVisible?: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

interface TelegramState {
  webApp: TelegramWebApp | null
  user: TelegramUser | null
  isTelegram: boolean
  isReady: boolean
}

/**
 * Initializes the Telegram WebApp SDK and exposes the current user + app handle.
 * Safely no-ops when the app is opened outside of Telegram.
 */
export function useTelegram(): TelegramState {
  const [state, setState] = useState<TelegramState>({
    webApp: null,
    user: null,
    isTelegram: false,
    isReady: false,
  })

  useEffect(() => {
    let cancelled = false

    const init = (webApp: TelegramWebApp) => {
      // Tell Telegram the Mini App is ready and take the full viewport.
      webApp.ready()
      webApp.expand()
      webApp.disableVerticalSwipes?.()
      const theme = webApp.themeParams ?? {}
      const background = theme.bg_color || '#19191b'
      const header = theme.header_bg_color || background
      webApp.setHeaderColor?.(header)
      webApp.setBackgroundColor?.(background)

      // Keep Telegram-native theme values available to the app without
      // replacing Toolkit's visual system.
      const root = document.documentElement
      if (theme.bg_color) root.style.setProperty('--tg-bg', theme.bg_color)
      if (theme.secondary_bg_color) root.style.setProperty('--tg-secondary-bg', theme.secondary_bg_color)
      if (theme.text_color) root.style.setProperty('--tg-text', theme.text_color)
      if (theme.hint_color) root.style.setProperty('--tg-hint', theme.hint_color)
      if (theme.button_color) root.style.setProperty('--tg-button', theme.button_color)
      if (theme.button_text_color) root.style.setProperty('--tg-button-text', theme.button_text_color)

      setState({
        webApp,
        user: webApp.initDataUnsafe?.user ?? null,
        isTelegram: true,
        isReady: true,
      })
    }

    // The SDK is injected via an async <Script>, so it may not be present on
    // the first effect run. Poll briefly until it loads, then give up.
    let attempts = 0
    const timer = setInterval(() => {
      if (cancelled) return
      const webApp = window.Telegram?.WebApp
      if (webApp) {
        clearInterval(timer)
        init(webApp)
      } else if (++attempts > 30) {
        clearInterval(timer)
        setState((prev) => ({ ...prev, isReady: true }))
      }
    }, 100)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  return state
}

/** Fire a light haptic tap if running inside Telegram. */
export function hapticTap(webApp: TelegramWebApp | null) {
  webApp?.HapticFeedback?.impactOccurred('light')
}
