import type {
  QueryTree,
  QueryNode,
  ConditionRule,
  ConditionGroup,
  LogicOperator,
  Operator,
  RuleValue,
  SQLOutput,
  MongoOutput,
  JSONOutput,
} from "@/lib/query-engine/types"
import {
  isConditionGroup,
  isConditionRule,
  isDateRange,
  isNumberRange,
} from "@/lib/query-engine/types"

// ── SQL Generator ────────────────────────────────────────────────────────────

function ruleToSQL(rule: ConditionRule): string {
  const { field, operator, value } = rule

  if (!field) return "/* incomplete rule */"

  switch (operator) {
    case "equals":
      return `${field} = ${formatSQLValue(value)}`
    case "not_equals":
      return `${field} != ${formatSQLValue(value)}`
    case "contains":
      return `${field} LIKE ${formatSQLValue(`%${value}%`)}`
    case "not_contains":
      return `${field} NOT LIKE ${formatSQLValue(`%${value}%`)}`
    case "starts_with":
      return `${field} LIKE ${formatSQLValue(`${value}%`)}`
    case "ends_with":
      return `${field} LIKE ${formatSQLValue(`%${value}`)}`
    case "greater_than":
      return `${field} > ${formatSQLValue(value)}`
    case "less_than":
      return `${field} < ${formatSQLValue(value)}`
    case "greater_than_or_equal":
      return `${field} >= ${formatSQLValue(value)}`
    case "less_than_or_equal":
      return `${field} <= ${formatSQLValue(value)}`
    case "between": {
      if (isDateRange(value)) return `${field} BETWEEN '${value.from}' AND '${value.to}'`
      if (isNumberRange(value)) return `${field} BETWEEN ${value.from} AND ${value.to}`
      return `/* invalid between value */`
    }
    case "in_array": {
      const items = Array.isArray(value) ? value.map(formatSQLValue).join(", ") : ""
      return `${field} IN (${items})`
    }
    case "not_in_array": {
      const items = Array.isArray(value) ? value.map(formatSQLValue).join(", ") : ""
      return `${field} NOT IN (${items})`
    }
    case "is_null":
      return `${field} IS NULL`
    case "is_not_null":
      return `${field} IS NOT NULL`
    case "regex":
      return `${field} REGEXP ${formatSQLValue(value)}`
    case "before":
      return `${field} < ${formatSQLValue(value)}`
    case "after":
      return `${field} > ${formatSQLValue(value)}`
    default:
      return `/* unknown operator */`
  }
}

function formatSQLValue(value: RuleValue): string {
  if (value === null || value === undefined) return "NULL"
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  return `'${String(value).replace(/'/g, "''")}'`
}

function groupToSQL(group: ConditionGroup, depth: number = 0): string {
  if (group.children.length === 0) return ""

  const indent = "  ".repeat(depth + 1)
  const logic = ` ${group.logic} `

  const parts = group.children
    .map((child) => {
      if (isConditionRule(child)) return indent + ruleToSQL(child)
      if (isConditionGroup(child)) {
        const inner = groupToSQL(child, depth + 1)
        return inner ? `${indent}(\n${inner}\n${indent})` : ""
      }
      return ""
    })
    .filter(Boolean)

  return parts.join(`\n${indent.slice(2)}${logic.trim()}\n`)
}

export function generateSQL(tree: QueryTree): SQLOutput {
  const where = groupToSQL(tree.root)
  const query = where
    ? `SELECT * FROM ${tree.schemaId}\nWHERE (\n${where}\n)`
    : `SELECT * FROM ${tree.schemaId}`

  return { format: "sql", query }
}

// ── Mongo Generator ──────────────────────────────────────────────────────────

function ruleToMongo(rule: ConditionRule): Record<string, unknown> {
  const { field, operator, value } = rule

  if (!field) return {}

  switch (operator) {
    case "equals":
      return { [field]: { $eq: value } }
    case "not_equals":
      return { [field]: { $ne: value } }
    case "contains":
      return { [field]: { $regex: String(value), $options: "i" } }
    case "not_contains":
      return { [field]: { $not: { $regex: String(value), $options: "i" } } }
    case "starts_with":
      return { [field]: { $regex: `^${String(value)}`, $options: "i" } }
    case "ends_with":
      return { [field]: { $regex: `${String(value)}$`, $options: "i" } }
    case "greater_than":
      return { [field]: { $gt: value } }
    case "less_than":
      return { [field]: { $lt: value } }
    case "greater_than_or_equal":
      return { [field]: { $gte: value } }
    case "less_than_or_equal":
      return { [field]: { $lte: value } }
    case "between": {
      if (isDateRange(value)) return { [field]: { $gte: value.from, $lte: value.to } }
      if (isNumberRange(value)) return { [field]: { $gte: value.from, $lte: value.to } }
      return {}
    }
    case "in_array":
      return { [field]: { $in: Array.isArray(value) ? value : [] } }
    case "not_in_array":
      return { [field]: { $nin: Array.isArray(value) ? value : [] } }
    case "is_null":
      return { [field]: { $eq: null } }
    case "is_not_null":
      return { [field]: { $ne: null } }
    case "regex":
      return { [field]: { $regex: String(value) } }
    case "before":
      return { [field]: { $lt: value } }
    case "after":
      return { [field]: { $gt: value } }
    default:
      return {}
  }
}

function groupToMongo(group: ConditionGroup): Record<string, unknown> {
  if (group.children.length === 0) return {}

  const mongoLogic = group.logic === "AND" ? "$and" : "$or"

  const parts = group.children
    .map((child) => {
      if (isConditionRule(child)) return ruleToMongo(child)
      if (isConditionGroup(child)) return groupToMongo(child)
      return null
    })
    .filter((p): p is Record<string, unknown> => p !== null && Object.keys(p).length > 0)

  if (parts.length === 0) return {}
  if (parts.length === 1) return parts[0]

  return { [mongoLogic]: parts }
}

export function generateMongo(tree: QueryTree): MongoOutput {
  return {
    format: "mongo",
    filter: groupToMongo(tree.root),
  }
}

// ── JSON Generator ───────────────────────────────────────────────────────────

export function generateJSON(tree: QueryTree): JSONOutput {
  return {
    format: "json",
    tree,
  }
}

// ── Entry Point ──────────────────────────────────────────────────────────────

export function generateQuery(tree: QueryTree, format: "sql" | "mongo" | "json") {
  switch (format) {
    case "sql":
      return generateSQL(tree)
    case "mongo":
      return generateMongo(tree)
    case "json":
      return generateJSON(tree)
  }
}
