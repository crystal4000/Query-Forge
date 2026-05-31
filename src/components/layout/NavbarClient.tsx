"use client"

import { PanelLeft } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/store/ui-store"

export function NavbarClient({ initialTheme }: { initialTheme: "light" | "dark" }) {
  const { toggleSidebar } = useUIStore()

  return (
    <nav className="h-12 border-b border-border bg-background flex items-center justify-between px-4 sm:px-5 shrink-0 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden w-8 h-8 text-text-faint hover:text-text-primary shrink-0"
          aria-label="Open sidebar"
        >
          <PanelLeft size={16} />
        </Button>
        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
        <span className="text-sm font-medium text-text-primary tracking-wide truncate">
          QueryForge
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline text-xs font-mono bg-accent-muted text-accent border border-accent/20 rounded px-2 py-0.5">
          v1.0
        </span>
        <ThemeToggle initialTheme={initialTheme} />
      </div>
    </nav>
  )
}
