"use client"

import { Sidebar } from "./Sidebar"
import { QueryBuilder } from "@/components/query-builder/QueryBuilder"
import { PreviewPanel } from "@/components/query-preview/PreviewPanel"
import { Toolbar } from "@/components/toolbar/Toolbar"
import { useUIStore } from "@/store/ui-store"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const { mobilePanel, setMobilePanel } = useUIStore()

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex border-b border-border shrink-0 lg:hidden">
        <MobileTab
          active={mobilePanel === "builder"}
          onClick={() => setMobilePanel("builder")}
          label="Builder"
        />
        <MobileTab
          active={mobilePanel === "preview"}
          onClick={() => setMobilePanel("preview")}
          label="Preview & Run"
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />

        <div className="flex flex-1 flex-col lg:flex-row min-w-0 overflow-hidden">
          <main
            className={cn(
              "flex flex-col flex-1 min-w-0 overflow-hidden",
              mobilePanel === "preview" && "max-lg:hidden"
            )}
          >
            <Toolbar />
            <QueryBuilder />
          </main>

          <div
            className={cn(
              "flex flex-col min-w-0 overflow-hidden",
              "max-lg:flex-1 max-lg:min-h-0",
              mobilePanel === "builder" && "max-lg:hidden",
              "lg:w-72 lg:shrink-0"
            )}
          >
            <PreviewPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 text-[11px] font-mono transition-colors border-b-2",
        active
          ? "text-accent border-accent bg-surface/50"
          : "text-text-faint border-transparent hover:text-text-muted"
      )}
    >
      {label}
    </button>
  )
}
