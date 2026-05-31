"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { Button } from "../ui/button"
import { SunIcon, MoonIcon } from "../ui/icons"

const THEME_KEY = "qb-theme"
const THEME_CHANGE_EVENT = "qb-theme-change"

type Theme = "dark" | "light"

function readCookieTheme(): Theme | null {
  const match = document.cookie.match(/(?:^|; )qb-theme=(light|dark)(?:;|$)/)
  if (match?.[1] === "light" || match?.[1] === "dark") return match[1]
  return null
}

function getThemeSnapshot(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === "light" || stored === "dark") return stored
  return readCookieTheme() ?? "dark"
}

function subscribeToTheme(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener("storage", handler)
  window.addEventListener(THEME_CHANGE_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(THEME_CHANGE_EVENT, handler)
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "light") {
    root.classList.add("light")
    root.classList.remove("dark")
  } else {
    root.classList.add("dark")
    root.classList.remove("light")
  }
}

function persistTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`
}

interface ThemeToggleProps {
  initialTheme: Theme
}

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const getServerThemeSnapshot = useCallback(() => initialTheme, [initialTheme])

  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark"
    persistTheme(next)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-7 h-7 text-text-muted hover:text-text-primary"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
