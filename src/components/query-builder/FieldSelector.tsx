"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSchema } from "@/lib/schema/schema"
import type { SchemaField } from "@/lib/query-engine/types"

interface FieldSelectorProps {
  schemaId: string
  value: string
  onChange: (field: string) => void
  error?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  string: "text-blue-400",
  number: "text-orange-400",
  boolean: "text-purple-400",
  date: "text-pink-400",
  enum: "text-accent",
}

export function FieldSelector({ schemaId, value, onChange, error }: FieldSelectorProps) {
  const schema = getSchema(schemaId)
  const fields = schema?.fields ?? []

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={`w-full sm:w-36 h-8 text-xs bg-surface border-border font-mono
          ${error ? "border-red-500" : ""}
        `}
      >
        <SelectValue placeholder="field..." />
      </SelectTrigger>
      <SelectContent className="bg-surface border-border">
        {fields.map((field: SchemaField) => (
          <SelectItem key={field.key} value={field.key} className="text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-text-primary">{field.key}</span>
              <span className={`text-[10px] ${TYPE_COLORS[field.type] ?? "text-text-muted"}`}>
                {field.type}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
