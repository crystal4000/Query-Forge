"use client"

import { useUIStore } from "@/store/ui-store"
import { LoadingState, EmptyState, ResultsTableSkeleton } from "@/components/ui/state-placeholder"
import { ResultsPanel } from "./ResultsPanel"
import { Play } from "lucide-react"

export function ResultsSection() {
  const { resultsOpen, lastRun, queryRunning } = useUIStore()

  if (!resultsOpen) return null

  if (queryRunning) {
    return (
      <div className="border-t border-border flex flex-col max-h-64 overflow-hidden shrink-0">
        <div className="px-3 py-2 border-b border-border">
          <LoadingState label="Running query..." className="py-4" />
        </div>
        <ResultsTableSkeleton />
      </div>
    )
  }

  if (!lastRun) {
    return (
      <div className="border-t border-border shrink-0">
        <EmptyState
          icon={<Play size={18} strokeWidth={1.5} />}
          title="No results yet"
          description="Fix validation errors, then click Run to filter mock data."
          className="py-6"
        />
      </div>
    )
  }

  return <ResultsPanel />
}
