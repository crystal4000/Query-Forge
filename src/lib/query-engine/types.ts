export type FieldType = "string" | "number" | "boolean" | "date" | "enum";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  enumValues?: string[]; // only populated when type === "enum"
}

export interface Schema {
  id: string;
  name: string;
  icon: string;
  fields: SchemaField[];
}

// Operators

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "between"
  | "in_array"
  | "not_in_array"
  | "is_null"
  | "is_not_null"
  | "regex"
  | "before" // date
  | "after"; // date

export interface OperatorDefinition {
  value: Operator;
  label: string;
  valueArity: "none" | "single" | "double"; // none = is_null, double = between
}

// Query Tree

export type LogicOperator = "AND" | "OR";

export interface ConditionRule {
  id: string;
  type: "rule";
  field: string;
  operator: Operator;
  value: RuleValue;
}

export interface ConditionGroup {
  id: string;
  type: "group";
  logic: LogicOperator;
  collapsed: boolean;
  children: QueryNode[]; // recursive — can hold rules or more groups
}

export type QueryNode = ConditionRule | ConditionGroup;

export interface QueryTree {
  schemaId: string;
  root: ConditionGroup;
}

// Rule Values

export type RuleValue =
  | string
  | number
  | boolean
  | null
  | string[] // in_array
  | number[] // in_array numeric
  | DateRangeValue // between for dates
  | NumberRangeValue; // between for numbers

export interface DateRangeValue {
  kind: "date-range";
  from: string; // ISO string
  to: string;
}

export interface NumberRangeValue {
  kind: "number-range";
  from: number;
  to: number;
}

// Query Output Formats

export type PreviewFormat = "sql" | "mongo" | "json";

export interface SQLOutput {
  format: "sql";
  query: string; // full SELECT ... WHERE ... string
}

export interface MongoOutput {
  format: "mongo";
  filter: Record<string, unknown>;
}

export interface JSONOutput {
  format: "json";
  tree: QueryTree; // the raw tree serialized
}

export type QueryOutput = SQLOutput | MongoOutput | JSONOutput;

// Validation

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Execution

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  totalCount: number;
  executionTimeMs: number;
}

// History & Presets

export interface QueryHistoryEntry {
  id: string;
  label: string; // auto-generated e.g. "Query · 12:43 PM"
  tree: QueryTree;
  resultCount: number;
  createdAt: string; // ISO string
}

export interface SavedPreset {
  id: string;
  name: string;
  description?: string;
  tree: QueryTree;
  createdAt: string;
}

// Type Guards

export function isConditionRule(node: QueryNode): node is ConditionRule {
  return node.type === "rule";
}

export function isConditionGroup(node: QueryNode): node is ConditionGroup {
  return node.type === "group";
}

export function isDateRange(value: RuleValue): value is DateRangeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as DateRangeValue).kind === "date-range"
  );
}

export function isNumberRange(value: RuleValue): value is NumberRangeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as NumberRangeValue).kind === "number-range"
  );
}
