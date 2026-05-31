import type { ConditionGroup, ConditionRule, QueryTree } from "@/lib/query-engine/types"

export function makeRule(overrides: Partial<ConditionRule> = {}): ConditionRule {
  return {
    id: "rule-1",
    type: "rule",
    field: "age",
    operator: "greater_than",
    value: 18,
    ...overrides,
  }
}

export function makeGroup(overrides: Partial<ConditionGroup> = {}): ConditionGroup {
  return {
    id: "group-1",
    type: "group",
    logic: "AND",
    collapsed: false,
    children: [],
    ...overrides,
  }
}

export function makeTree(
  overrides: Partial<QueryTree> & { root?: ConditionGroup } = {}
): QueryTree {
  const { root, ...rest } = overrides
  return {
    schemaId: "users",
    root: root ?? makeGroup({ id: "root", children: [makeRule({ id: "default-rule" })] }),
    ...rest,
  }
}
