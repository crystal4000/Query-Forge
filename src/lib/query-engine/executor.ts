import type {
  QueryTree,
  ConditionGroup,
  ConditionRule,
  QueryNode,
  QueryResult,
} from "@/lib/query-engine/types"
import {
  isConditionGroup,
  isConditionRule,
  isDateRange,
  isNumberRange,
} from "@/lib/query-engine/types"
import { MOCK_DATASETS } from "@/app/data/mock-datasets"

// ── Rule Evaluator ───────────────────────────────────────────────────────────

function evaluateRule(rule: ConditionRule, row: Record<string, unknown>): boolean {
  const { field, operator, value } = rule
  const rowValue = row[field]

  // treat undefined fields as null
  if (rowValue === undefined) {
    return operator === "is_null"
  }

  switch (operator) {
    case "equals":
      return String(rowValue) === String(value)
    case "not_equals":
      return String(rowValue) !== String(value)
    case "contains":
      return String(rowValue).toLowerCase().includes(String(value).toLowerCase())
    case "not_contains":
      return !String(rowValue).toLowerCase().includes(String(value).toLowerCase())
    case "starts_with":
      return String(rowValue).toLowerCase().startsWith(String(value).toLowerCase())
    case "ends_with":
      return String(rowValue).toLowerCase().endsWith(String(value).toLowerCase())
    case "greater_than":
      return Number(rowValue) > Number(value)
    case "less_than":
      return Number(rowValue) < Number(value)
    case "greater_than_or_equal":
      return Number(rowValue) >= Number(value)
    case "less_than_or_equal":
      return Number(rowValue) <= Number(value)
    case "between": {
      if (isNumberRange(value)) {
        const n = Number(rowValue)
        return n >= value.from && n <= value.to
      }
      if (isDateRange(value)) {
        const d = new Date(String(rowValue)).getTime()
        return d >= new Date(value.from).getTime() && d <= new Date(value.to).getTime()
      }
      return false
    }
    case "in_array":
      return Array.isArray(value) && value.map(String).includes(String(rowValue))
    case "not_in_array":
      return Array.isArray(value) && !value.map(String).includes(String(rowValue))
    case "is_null":
      return rowValue === null || rowValue === undefined || rowValue === ""
    case "is_not_null":
      return rowValue !== null && rowValue !== undefined && rowValue !== ""
    case "regex": {
      try {
        return new RegExp(String(value)).test(String(rowValue))
      } catch {
        return false
      }
    }
    case "before":
      return new Date(String(rowValue)).getTime() < new Date(String(value)).getTime()
    case "after":
      return new Date(String(rowValue)).getTime() > new Date(String(value)).getTime()
    default:
      return false
  }
}

// ── Group Evaluator (recursive) ──────────────────────────────────────────────

function evaluateNode(node: QueryNode, row: Record<string, unknown>): boolean {
  if (isConditionRule(node)) return evaluateRule(node, row)

  if (isConditionGroup(node)) {
    if (node.children.length === 0) return true

    if (node.logic === "AND") {
      return node.children.every((child) => evaluateNode(child, row))
    } else {
      return node.children.some((child) => evaluateNode(child, row))
    }
  }

  return false
}

// ── Entry Point ──────────────────────────────────────────────────────────────

export function executeQuery<T = Record<string, unknown>>(tree: QueryTree): QueryResult<T> {
  const start = performance.now()

  const dataset = MOCK_DATASETS[tree.schemaId] ?? []

  const rows = dataset.filter((row) => evaluateNode(tree.root, row)) as T[]

  return {
    rows,
    totalCount: rows.length,
    executionTimeMs: Math.round(performance.now() - start),
  }
}
