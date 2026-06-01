"use client"

import { useMemo, useSyncExternalStore } from "react"
import { ConditionGroup } from "./ConditionGroup"
import { useQueryStore } from "@/store/query-store"
import { validateTree } from "@/lib/query-engine/validator"
import { useShowValidationErrors } from "@/hooks/use-show-validation-errors"

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
  const showValidationErrors = useShowValidationErrors()

  const errorIds = useMemo(() => {
    if (!showValidationErrors) return new Set<string>()
    const result = validateTree(tree)
    return new Set(result.errors.map((e) => e.nodeId))
  }, [tree, showValidationErrors])

  if (!isClient) return null

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4">
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
