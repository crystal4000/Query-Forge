import { describe, it, expect, beforeEach, vi } from "vitest"
import { useQueryStore } from "@/store/query-store"
import { isConditionGroup, isConditionRule } from "@/lib/query-engine/types"

vi.mock("nanoid", () => ({
  nanoid: () => "new-id",
}))

function resetStore() {
  useQueryStore.setState({
    tree: {
      schemaId: "users",
      root: {
        id: "root",
        type: "group",
        logic: "AND",
        collapsed: false,
        children: [
          {
            id: "default-rule",
            type: "rule",
            field: "",
            operator: "equals",
            value: "",
          },
        ],
      },
    },
  })
  useQueryStore.temporal.getState().clear()
}

describe("useQueryStore", () => {
  beforeEach(() => {
    resetStore()
  })

  it("starts with stable default ids for the users schema", () => {
    const { tree } = useQueryStore.getState()
    expect(tree.schemaId).toBe("users")
    expect(tree.root.id).toBe("root")
    expect(tree.root.children[0].id).toBe("default-rule")
  })

  it("adds a rule to a group immutably", () => {
    const before = useQueryStore.getState().tree
    useQueryStore.getState().addRule("root")
    const after = useQueryStore.getState().tree

    expect(after).not.toBe(before)
    expect(after.root.children).toHaveLength(2)
    expect(after.root.children[1].id).toBe("new-id")
  })

  it("resets operator and value when the field changes", () => {
    useQueryStore.getState().updateRuleField("default-rule", "age")
    useQueryStore.getState().updateRuleOperator("default-rule", "greater_than")
    useQueryStore.getState().updateRuleValue("default-rule", 21)

    useQueryStore.getState().updateRuleField("default-rule", "status")

    const rule = useQueryStore.getState().tree.root.children[0]
    expect(isConditionRule(rule)).toBe(true)
    if (isConditionRule(rule)) {
      expect(rule.field).toBe("status")
      expect(rule.operator).toBe("equals")
      expect(rule.value).toBe("")
    }
  })

  it("toggles group logic between AND and OR", () => {
    useQueryStore.getState().toggleGroupLogic("root")
    expect(useQueryStore.getState().tree.root.logic).toBe("OR")

    useQueryStore.getState().toggleGroupLogic("root")
    expect(useQueryStore.getState().tree.root.logic).toBe("AND")
  })

  it("removes a nested node by id", () => {
    useQueryStore.getState().addGroup("root")
    const nestedId = useQueryStore.getState().tree.root.children[1].id

    useQueryStore.getState().removeNode(nestedId)
    expect(useQueryStore.getState().tree.root.children).toHaveLength(1)
  })

  it("reorders children within a group", () => {
    useQueryStore.getState().addRule("root")
    const [first, second] = useQueryStore.getState().tree.root.children

    useQueryStore.getState().reorderChildren("root", [second, first])
    expect(useQueryStore.getState().tree.root.children[0].id).toBe(second.id)
    expect(useQueryStore.getState().tree.root.children[1].id).toBe(first.id)
  })

  it("setSchema replaces the tree for the new schema", () => {
    useQueryStore.getState().updateRuleField("default-rule", "age")
    useQueryStore.getState().setSchema("orders")

    const { tree } = useQueryStore.getState()
    expect(tree.schemaId).toBe("orders")
    expect(tree.root.children[0]).toMatchObject({ field: "", operator: "equals", value: "" })
  })

  it("records undo and redo for tree mutations", () => {
    useQueryStore.getState().updateRuleField("default-rule", "age")
    expect(useQueryStore.getState().tree.root.children[0]).toMatchObject({ field: "age" })

    useQueryStore.temporal.getState().undo()
    expect(useQueryStore.getState().tree.root.children[0]).toMatchObject({ field: "" })

    useQueryStore.temporal.getState().redo()
    expect(useQueryStore.getState().tree.root.children[0]).toMatchObject({ field: "age" })
  })

  it("adds nested OR groups with a default rule", () => {
    useQueryStore.getState().addGroup("root")
    const nested = useQueryStore.getState().tree.root.children[1]

    expect(isConditionGroup(nested)).toBe(true)
    if (isConditionGroup(nested)) {
      expect(nested.logic).toBe("OR")
      expect(nested.children).toHaveLength(1)
      expect(nested.children[0].id).toBe("new-id")
    }
  })
})
