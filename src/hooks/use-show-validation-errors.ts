"use client"

import { useStore } from "zustand"
import { useQueryStore } from "@/store/query-store"
import { useUIStore } from "@/store/ui-store"

/** True after the user edits the tree or tries to Run an invalid query. */
export function useShowValidationErrors() {
  const revealed = useUIStore((s) => s.validationRevealed)
  const hasEdited = useStore(useQueryStore.temporal, (s) => s.pastStates.length > 0)
  return revealed || hasEdited
}
