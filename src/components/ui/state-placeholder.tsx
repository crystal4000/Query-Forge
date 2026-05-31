"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({
  label = "Loading...",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 py-8", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-5 text-accent animate-spin" aria-hidden />
      <p className="text-[11px] font-mono text-text-faint">{label}</p>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  className,
  compact = false,
}: {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
  compact?: boolean
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-[10px] font-mono text-text-faint",
          className
        )}
      >
        {icon && <span className="opacity-50 shrink-0">{icon}</span>}
        <span>{title}</span>
      </div>
    )
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-2 px-4 text-center", className)}
    >
      {icon && <div className="text-text-faint opacity-60">{icon}</div>}
      <p className="text-[11px] font-mono text-text-muted">{title}</p>
      {description && (
        <p className="text-[10px] font-mono text-text-faint max-w-[220px]">{description}</p>
      )}
    </div>
  )
}

export function ResultsTableSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse px-3 py-3 space-y-2", className)}
      role="status"
      aria-label="Loading results"
    >
      <div className="flex gap-2">
        <div className="h-2.5 flex-1 rounded bg-border" />
        <div className="h-2.5 flex-1 rounded bg-border" />
        <div className="h-2.5 flex-1 rounded bg-border" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          <div className="h-2 flex-1 rounded bg-border/70" />
          <div className="h-2 flex-1 rounded bg-border/70" />
          <div className="h-2 flex-1 rounded bg-border/70" />
        </div>
      ))}
    </div>
  )
}
