"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getField } from "@/lib/schema/schema"
import { getOperatorDefinition } from "@/lib/schema/schema-utils"
import type { Operator, RuleValue } from "@/lib/query-engine/types"

interface ValueInputProps {
  schemaId: string
  fieldKey: string
  operator: Operator | ""
  value: RuleValue
  onChange: (value: RuleValue) => void
  error?: boolean
}

export function ValueInput({
  schemaId,
  fieldKey,
  operator,
  value,
  onChange,
  error,
}: ValueInputProps) {
  const field = getField(schemaId, fieldKey)
  const opDef = operator ? getOperatorDefinition(operator as Operator) : null

  // nothing to render for nullary operators or when no field/op selected
  if (!field || !opDef || opDef.valueArity === "none") {
    return null
  }

  const baseInputClass = `h-8 text-xs bg-surface border-border font-mono w-28
    ${error ? "border-red-500" : ""}
  `

  // ── Enum → dropdown ──
  if (field.type === "enum" && field.enumValues && opDef.valueArity === "single") {
    return (
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger className={`${baseInputClass} w-32`}>
          <SelectValue placeholder="value..." />
        </SelectTrigger>
        <SelectContent className="bg-surface border-border">
          {field.enumValues.map((v) => (
            <SelectItem key={v} value={v} className="text-xs">
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // ── Boolean → dropdown ──
  if (field.type === "boolean") {
    return (
      <Select value={String(value ?? "")} onValueChange={onChange}>
        <SelectTrigger className={`${baseInputClass} w-24`}>
          <SelectValue placeholder="value..." />
        </SelectTrigger>
        <SelectContent className="bg-surface border-border">
          <SelectItem value="true" className="text-xs">
            true
          </SelectItem>
          <SelectItem value="false" className="text-xs">
            false
          </SelectItem>
        </SelectContent>
      </Select>
    )
  }

  // ── Date → date input ──
  if (field.type === "date" && opDef.valueArity === "single") {
    return (
      <Input
        type="date"
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInputClass} w-36`}
      />
    )
  }

  // ── Between → two inputs ──
  if (opDef.valueArity === "double") {
    const range = (value as { from: string | number; to: string | number }) ?? {
      from: "",
      to: "",
    }
    const inputType = field.type === "date" ? "date" : "number"

    return (
      <div className="flex items-center gap-1">
        <Input
          type={inputType}
          placeholder="from"
          value={String(range.from ?? "")}
          onChange={(e) =>
            onChange({
              kind: field.type === "date" ? "date-range" : "number-range",
              from: field.type === "date" ? e.target.value : Number(e.target.value),
              to: range.to,
            } as RuleValue)
          }
          className={`${baseInputClass} w-24`}
        />
        <span className="text-text-faint text-xs">→</span>
        <Input
          type={inputType}
          placeholder="to"
          value={String(range.to ?? "")}
          onChange={(e) =>
            onChange({
              kind: field.type === "date" ? "date-range" : "number-range",
              from: range.from,
              to: field.type === "date" ? e.target.value : Number(e.target.value),
            } as RuleValue)
          }
          className={`${baseInputClass} w-24`}
        />
      </div>
    )
  }

  // ── Number input ──
  if (field.type === "number") {
    return (
      <Input
        type="number"
        placeholder="value..."
        value={String(value ?? "")}
        onChange={(e) => onChange(Number(e.target.value))}
        className={baseInputClass}
      />
    )
  }

  // ── Default: text input ──
  return (
    <Input
      type="text"
      placeholder="value..."
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
      className={baseInputClass}
    />
  )
}
