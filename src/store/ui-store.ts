import { create } from "zustand"
import type { PreviewFormat, QueryResult, QueryTree } from "@/lib/query-engine/types"

interface UIStoreState {
  previewFormat: PreviewFormat
  setPreviewFormat: (format: PreviewFormat) => void

  resultsOpen: boolean
  toggleResults: () => void

  lastRun: QueryResult | null
  lastRunTreeKey: string | null
  setLastRun: (tree: QueryTree, result: QueryResult) => void
}

export const useUIStore = create<UIStoreState>()((set) => ({
  previewFormat: "sql",
  setPreviewFormat: (format) => set({ previewFormat: format }),

  resultsOpen: false,
  toggleResults: () => set((state) => ({ resultsOpen: !state.resultsOpen })),

  lastRun: null,
  lastRunTreeKey: null,
  setLastRun: (tree, result) =>
    set({
      lastRun: result,
      lastRunTreeKey: JSON.stringify(tree),
      resultsOpen: true,
    }),
}))
