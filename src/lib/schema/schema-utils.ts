import type { FieldType, Operator, OperatorDefinition } from "@/lib/query-engine/types"

// Maps each field type to the operators that make sense for it
const OPERATORS_BY_TYPE: Record<FieldType, Operator[]> = {
  string: [
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "starts_with",
    "ends_with",
    "is_null",
    "is_not_null",
    "regex",
  ],
  number: [
    "equals",
    "not_equals",
    "greater_than",
    "less_than",
    "greater_than_or_equal",
    "less_than_or_equal",
    "between",
    "in_array",
    "is_null",
    "is_not_null",
  ],
  boolean: ["equals", "is_null", "is_not_null"],
  date: ["equals", "not_equals", "before", "after", "between", "is_null", "is_not_null"],
  enum: ["equals", "not_equals", "in_array", "not_in_array", "is_null", "is_not_null"],
}

// Full operator definitions with labels and arity
export const OPERATOR_DEFINITIONS: Record<Operator, OperatorDefinition> = {
  equals: { value: "equals", label: "equals", valueArity: "single" },
  not_equals: {
    value: "not_equals",
    label: "not equals",
    valueArity: "single",
  },
  contains: { value: "contains", label: "contains", valueArity: "single" },
  not_contains: {
    value: "not_contains",
    label: "does not contain",
    valueArity: "single",
  },
  starts_with: {
    value: "starts_with",
    label: "starts with",
    valueArity: "single",
  },
  ends_with: { value: "ends_with", label: "ends with", valueArity: "single" },
  greater_than: {
    value: "greater_than",
    label: "greater than",
    valueArity: "single",
  },
  less_than: { value: "less_than", label: "less than", valueArity: "single" },
  greater_than_or_equal: {
    value: "greater_than_or_equal",
    label: "≥",
    valueArity: "single",
  },
  less_than_or_equal: {
    value: "less_than_or_equal",
    label: "≤",
    valueArity: "single",
  },
  between: { value: "between", label: "between", valueArity: "double" },
  in_array: { value: "in_array", label: "is any of", valueArity: "single" },
  not_in_array: {
    value: "not_in_array",
    label: "is none of",
    valueArity: "single",
  },
  is_null: { value: "is_null", label: "is empty", valueArity: "none" },
  is_not_null: {
    value: "is_not_null",
    label: "is not empty",
    valueArity: "none",
  },
  regex: { value: "regex", label: "matches regex", valueArity: "single" },
  before: { value: "before", label: "before", valueArity: "single" },
  after: { value: "after", label: "after", valueArity: "single" },
}

export function getOperatorsForType(type: FieldType): OperatorDefinition[] {
  return OPERATORS_BY_TYPE[type].map((op) => OPERATOR_DEFINITIONS[op])
}

export function getOperatorDefinition(op: Operator): OperatorDefinition {
  return OPERATOR_DEFINITIONS[op]
}
