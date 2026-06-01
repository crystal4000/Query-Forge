import { create, useStore } from "zustand"
import { temporal } from "zundo"
import { nanoid } from "nanoid"
import type {
  QueryTree,
  QueryNode,
  ConditionGroup,
  ConditionRule,
  LogicOperator,
  Operator,
  RuleValue,
} from "@/lib/query-engine/types"
import { isConditionGroup } from "@/lib/query-engine/types"
import { useUIStore } from "@/store/ui-store"

//  Helpers

const DEFAULT_ROOT_ID = "root"
const DEFAULT_RULE_ID = "default-rule"

function makeRule(): ConditionRule {
  return {
    id: nanoid(),
    type: "rule",
    field: "",
    operator: "equals",
    value: "",
  }
}

function makeGroup(logic: LogicOperator = "AND"): ConditionGroup {
  return {
    id: nanoid(),
    type: "group",
    logic,
    collapsed: false,
    children: [makeRule()],
  }
}

function makeDefaultTree(schemaId: string): QueryTree {
  return {
    schemaId,
    root: {
      id: DEFAULT_ROOT_ID,
      type: "group",
      logic: "AND",
      collapsed: false,
      children: [
        {
          id: DEFAULT_RULE_ID,
          type: "rule",
          field: "",
          operator: "equals",
          value: "",
        },
      ],
    },
  }
}

// ── Tree Traversal Helpers ───────────────────────────────────────────────────
// All mutations work by finding the target node by id and returning a new tree
// immutably. We never mutate in place.

function updateNodeInTree(
  node: QueryNode,
  targetId: string,
  updater: (node: QueryNode) => QueryNode
): QueryNode {
  if (node.id === targetId) return updater(node)

  if (isConditionGroup(node)) {
    return {
      ...node,
      children: node.children.map((child) => updateNodeInTree(child, targetId, updater)),
    }
  }

  return node
}

function removeNodeFromTree(node: QueryNode, targetId: string): QueryNode | null {
  if (!isConditionGroup(node)) return node

  const filtered = node.children
    .filter((child) => child.id !== targetId)
    .map((child) => removeNodeFromTree(child, targetId))
    .filter(Boolean) as QueryNode[]

  return { ...node, children: filtered }
}

function addChildToGroup(node: QueryNode, targetGroupId: string, child: QueryNode): QueryNode {
  if (!isConditionGroup(node)) return node
  if (node.id === targetGroupId) {
    return { ...node, children: [...node.children, child] }
  }
  return {
    ...node,
    children: node.children.map((c) => addChildToGroup(c, targetGroupId, child)),
  }
}

function reorderChildrenInGroup(
  node: QueryNode,
  targetGroupId: string,
  newChildren: QueryNode[]
): QueryNode {
  if (!isConditionGroup(node)) return node
  if (node.id === targetGroupId) {
    return { ...node, children: newChildren }
  }
  return {
    ...node,
    children: node.children.map((c) => reorderChildrenInGroup(c, targetGroupId, newChildren)),
  }
}

//  Store Types

interface QueryStoreState {
  tree: QueryTree

  // Schema
  setSchema: (schemaId: string) => void

  // Rule actions
  addRule: (groupId: string) => void
  removeNode: (nodeId: string) => void
  updateRuleField: (ruleId: string, field: string) => void
  updateRuleOperator: (ruleId: string, operator: Operator) => void
  updateRuleValue: (ruleId: string, value: RuleValue) => void

  // Group actions
  addGroup: (parentGroupId: string) => void
  toggleGroupLogic: (groupId: string) => void
  toggleGroupCollapsed: (groupId: string) => void

  // Reorder (for dnd-kit)
  reorderChildren: (groupId: string, newChildren: QueryNode[]) => void

  // Import / reset
  setTree: (tree: QueryTree) => void
  resetTree: () => void
}

//  Store

export const useQueryStore = create<QueryStoreState>()(
  temporal(
    (set) => ({
      tree: makeDefaultTree("users"),

      setSchema: (schemaId) => {
        useUIStore.getState().resetValidationFeedback()
        set({ tree: makeDefaultTree(schemaId) })
      },

      addRule: (groupId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: addChildToGroup(state.tree.root, groupId, makeRule()) as ConditionGroup,
          },
        })),

      removeNode: (nodeId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: removeNodeFromTree(state.tree.root, nodeId) as ConditionGroup,
          },
        })),

      updateRuleField: (ruleId, field) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: updateNodeInTree(state.tree.root, ruleId, (node) => ({
              ...node,
              field,
              operator: "equals", // reset operator when field changes
              value: "",
            })) as ConditionGroup,
          },
        })),

      updateRuleOperator: (ruleId, operator) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: updateNodeInTree(state.tree.root, ruleId, (node) => ({
              ...node,
              operator,
              value: "", // reset value when operator changes
            })) as ConditionGroup,
          },
        })),

      updateRuleValue: (ruleId, value) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: updateNodeInTree(state.tree.root, ruleId, (node) => ({
              ...node,
              value,
            })) as ConditionGroup,
          },
        })),

      addGroup: (parentGroupId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: addChildToGroup(
              state.tree.root,
              parentGroupId,
              makeGroup("OR") // nested groups default to OR for contrast
            ) as ConditionGroup,
          },
        })),

      toggleGroupLogic: (groupId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: updateNodeInTree(state.tree.root, groupId, (node) => ({
              ...node,
              logic: (node as ConditionGroup).logic === "AND" ? "OR" : "AND",
            })) as ConditionGroup,
          },
        })),

      toggleGroupCollapsed: (groupId) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: updateNodeInTree(state.tree.root, groupId, (node) => ({
              ...node,
              collapsed: !(node as ConditionGroup).collapsed,
            })) as ConditionGroup,
          },
        })),

      reorderChildren: (groupId, newChildren) =>
        set((state) => ({
          tree: {
            ...state.tree,
            root: reorderChildrenInGroup(state.tree.root, groupId, newChildren) as ConditionGroup,
          },
        })),

      setTree: (tree) => set({ tree }),

      resetTree: () => {
        useUIStore.getState().resetValidationFeedback()
        set((state) => ({
          tree: makeDefaultTree(state.tree.schemaId),
        }))
      },
    }),
    {
      // Only these actions get recorded in undo history
      // Collapsing groups and schema switching don't need to be undoable
      partialize: (state) => ({ tree: state.tree }),
    }
  )
)

//  Undo/Redo
// zundo exposes useTemporalStore separately

// Derive the temporal store from the query store instance
export const useUndoRedo = () => {
  const temporal = useQueryStore.temporal

  const undo = useStore(temporal, (s) => s.undo)
  const redo = useStore(temporal, (s) => s.redo)
  const canUndo = useStore(temporal, (s) => s.pastStates.length > 0)
  const canRedo = useStore(temporal, (s) => s.futureStates.length > 0)

  return { undo, redo, canUndo, canRedo }
}
