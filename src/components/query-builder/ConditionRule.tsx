"use client"

import { useId } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { GripVertical, X } from "lucide-react"
import { FieldSelector } from "./FieldSelector"
import { OperatorSelector } from "./OperatorSelector"
import { ValueInput } from "./ValueInput"
import { useQueryStore } from "@/store/query-store"
import type { ConditionRule as ConditionRuleType } from "@/lib/query-engine/types"

interface ConditionRuleProps {
  rule: ConditionRuleType
  schemaId: string
  errorIds: Set<string>
}

export function ConditionRule({ rule, schemaId, errorIds }: ConditionRuleProps) {
  const { updateRuleField, updateRuleOperator, updateRuleValue, removeNode } = useQueryStore()

  const reactId = useId()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rule.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const hasError = errorIds.has(rule.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row sm:items-center gap-2 group
        ${hasError ? "ring-1 ring-red-500/40 rounded-md p-1 sm:px-1" : ""}
      `}
    >
      {/* drag handle */}
      <button
        {...attributes}
        {...listeners}
        id={reactId}
        className="self-start sm:self-center text-border hover:text-text-faint cursor-grab active:cursor-grabbing opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
        <FieldSelector
          schemaId={schemaId}
          value={rule.field}
          onChange={(field) => updateRuleField(rule.id, field)}
          error={hasError && !rule.field}
        />

        <OperatorSelector
          schemaId={schemaId}
          fieldKey={rule.field}
          value={rule.operator}
          onChange={(op) => updateRuleOperator(rule.id, op)}
          error={hasError && !rule.operator}
        />

        <ValueInput
          schemaId={schemaId}
          fieldKey={rule.field}
          operator={rule.operator}
          value={rule.value}
          onChange={(val) => updateRuleValue(rule.id, val)}
          error={hasError}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeNode(rule.id)}
        className="self-end sm:self-center w-6 h-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-text-faint hover:text-red-400"
        aria-label="Remove rule"
      >
        <X size={12} />
      </Button>
    </div>
  )
}
