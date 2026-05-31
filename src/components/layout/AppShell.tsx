"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { PageLoader } from "./PageLoader"
import { cn } from "@/lib/utils"

const MIN_LOADER_MS = 800

function subscribe() {
  return () => {}
}

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const isClient = useIsClient()
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!isClient) return

    const started = performance.now()
    const finish = () => {
      const elapsed = performance.now() - started
      const remaining = Math.max(0, MIN_LOADER_MS - elapsed)
      window.setTimeout(() => setShowLoader(false), remaining)
    }

    const id = requestAnimationFrame(finish)
    return () => cancelAnimationFrame(id)
  }, [isClient])

  const loaderVisible = !isClient || showLoader

  return (
    <div className="relative h-full min-h-screen">
      <div
        className={cn(
          "h-full min-h-screen transition-opacity duration-300 ease-out",
          loaderVisible ? "opacity-0" : "opacity-100"
        )}
      >
        {children}
      </div>

      {loaderVisible && <PageLoader />}
    </div>
  )
}
