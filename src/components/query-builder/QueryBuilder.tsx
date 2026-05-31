"use client"

import { useMemo, useSyncExternalStore } from "react"
import { ConditionGroup } from "./ConditionGroup"
import { useQueryStore } from "@/store/query-store"
import { validateTree } from "@/lib/query-engine/validator"

function subscribe() {
  return () => {}
}

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false // server snapshot
  )
}

export function QueryBuilder() {
  const tree = useQueryStore((s) => s.tree)
  const isClient = useIsClient()

  const errorIds = useMemo(() => {
    const result = validateTree(tree)
    return new Set(result.errors.map((e) => e.nodeId))
  }, [tree])

  if (!isClient) return null

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <ConditionGroup
        group={tree.root}
        schemaId={tree.schemaId}
        depth={0}
        isRoot
        errorIds={errorIds}
      />
    </div>
  )
}
