"use client"

import type { LogicOperator } from "@/lib/query-engine/types"

interface LogicToggleProps {
  value: LogicOperator
  onChange: (logic: LogicOperator) => void
}

export function LogicToggle({ value, onChange }: LogicToggleProps) {
  return (
    <div className="flex rounded overflow-hidden border border-border text-[11px] font-mono shrink-0">
      {(["AND", "OR"] as LogicOperator[]).map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1 transition-colors duration-150
            ${
              value === opt
                ? "bg-accent text-background font-medium"
                : "bg-transparent text-text-faint hover:text-text-muted"
            }
          `}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
