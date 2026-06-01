import type {
  QueryTree,
  QueryNode,
  ConditionRule,
  ConditionGroup,
  ValidationResult,
  ValidationError,
} from "@/lib/query-engine/types"
import { isConditionGroup, isConditionRule } from "@/lib/query-engine/types"
import { getField } from "@/lib/schema/schema"
import { getOperatorDefinition } from "@/lib/schema/schema-utils"

function validateRule(rule: ConditionRule, schemaId: string, errors: ValidationError[]) {
  // field must be selected
  if (!rule.field) {
    errors.push({ nodeId: rule.id, message: "Select a field" })
    return
  }

  // field must exist in schema
  const schemaField = getField(schemaId, rule.field)
  if (!schemaField) {
    errors.push({ nodeId: rule.id, message: `Unknown field: ${rule.field}` })
    return
  }

  // operator must be selected
  if (!rule.operator) {
    errors.push({ nodeId: rule.id, message: "Select an operator" })
    return
  }

  const opDef = getOperatorDefinition(rule.operator)

  // value required unless operator is nullary
  if (opDef.valueArity !== "none") {
    const isEmpty =
      rule.value === "" ||
      rule.value === null ||
      rule.value === undefined ||
      (Array.isArray(rule.value) && rule.value.length === 0)

    if (isEmpty) {
      errors.push({ nodeId: rule.id, message: "Enter a value" })
    }
  }

  // type-specific checks
  if (schemaField.type === "number" && opDef.valueArity === "single") {
    if (isNaN(Number(rule.value))) {
      errors.push({ nodeId: rule.id, message: "Value must be a number" })
    }
  }

  if (schemaField.type === "boolean" && opDef.valueArity === "single") {
    if (rule.value !== "true" && rule.value !== "false" && typeof rule.value !== "boolean") {
      errors.push({ nodeId: rule.id, message: "Value must be true or false" })
    }
  }
}

function validateGroup(group: ConditionGroup, schemaId: string, errors: ValidationError[]) {
  // a group must have at least one child
  if (group.children.length === 0) {
    errors.push({
      nodeId: group.id,
      message: "Group must have at least one condition",
    })
    return
  }

  // recurse into children
  group.children.forEach((child) => validateNode(child, schemaId, errors))
}

function validateNode(node: QueryNode, schemaId: string, errors: ValidationError[]) {
  if (isConditionRule(node)) validateRule(node, schemaId, errors)
  if (isConditionGroup(node)) validateGroup(node, schemaId, errors)
}

export function validateTree(tree: QueryTree): ValidationResult {
  const errors: ValidationError[] = []
  validateNode(tree.root, tree.schemaId, errors)
  return {
    valid: errors.length === 0,
    errors,
  }
}

export function isRuleComplete(rule: ConditionRule, schemaId: string): boolean {
  const errors: ValidationError[] = []
  validateRule(rule, schemaId, errors)
  return errors.length === 0
}

/** Human-readable summary for toolbar / preview status (not just "N errors"). */
export function formatValidationSummary(errors: ValidationError[]): string {
  if (errors.length === 0) return ""

  if (errors.length === 1) return errors[0].message

  const unique = [...new Set(errors.map((e) => e.message))]
  if (unique.length === 1) {
    return `${errors.length} conditions — ${unique[0]}`
  }

  const preview = unique.slice(0, 2).join(" · ")
  return unique.length > 2 ? `${preview} · …` : preview
}
