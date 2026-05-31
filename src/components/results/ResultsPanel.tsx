"use client"

import { useMemo } from "react"
import { useQueryStore } from "@/store/query-store"
import { useUIStore } from "@/store/ui-store"
import { executeQuery } from "@/lib/query-engine/executor"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function ResultsPanel() {
  const tree = useQueryStore((s) => s.tree)
  const { toggleResults } = useUIStore()

  const result = useMemo(() => executeQuery(tree), [tree])

  return (
    <div className="border-t border-border flex flex-col max-h-64 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-accent">
            {result.totalCount} result{result.totalCount !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-text-faint font-mono">{result.executionTimeMs}ms</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleResults}
          className="w-5 h-5 text-text-faint hover:text-text-primary"
        >
          <X size={11} />
        </Button>
      </div>

      {/* Results */}
      <div className="overflow-y-auto flex-1">
        {result.totalCount === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-[11px] text-text-faint font-mono">no matching rows</p>
          </div>
        ) : (
          <table className="w-full text-[10px] font-mono">
            <thead className="sticky top-0 bg-surface">
              <tr>
                {Object.keys(result.rows[0]).map((key) => (
                  <th
                    key={key}
                    className="text-left px-3 py-1.5 text-text-faint border-b border-border font-medium"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-surface/50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-3 py-1.5 text-text-muted truncate max-w-24">
                      {String(val ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
