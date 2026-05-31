"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getOperatorsForType } from "@/lib/schema/schema-utils"
import { getField } from "@/lib/schema/schema"
import type { Operator } from "@/lib/query-engine/types"

interface OperatorSelectorProps {
  schemaId: string
  fieldKey: string
  value: Operator | ""
  onChange: (operator: Operator) => void
  error?: boolean
}

export function OperatorSelector({
  schemaId,
  fieldKey,
  value,
  onChange,
  error,
}: OperatorSelectorProps) {
  const field = getField(schemaId, fieldKey)
  const operators = field ? getOperatorsForType(field.type) : []

  return (
    <Select value={value} onValueChange={(v) => onChange(v as Operator)} disabled={!fieldKey}>
      <SelectTrigger
        className={`w-40 h-8 text-xs bg-surface border-border
          ${error ? "border-red-500" : ""}
          ${!fieldKey ? "opacity-40" : ""}
        `}
      >
        <SelectValue placeholder="operator..." />
      </SelectTrigger>
      <SelectContent className="bg-surface border-border">
        {operators.map((op) => (
          <SelectItem key={op.value} value={op.value} className="text-xs">
            {op.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
