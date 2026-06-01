import { create } from "zustand"
import type { PreviewFormat, QueryResult, QueryTree } from "@/lib/query-engine/types"

interface UIStoreState {
  previewFormat: PreviewFormat
  setPreviewFormat: (format: PreviewFormat) => void

  resultsOpen: boolean
  toggleResults: () => void
  openResults: () => void

  lastRun: QueryResult | null
  lastRunTreeKey: string | null
  setLastRun: (tree: QueryTree, result: QueryResult) => void

  queryRunning: boolean
  setQueryRunning: (running: boolean) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  mobilePanel: "builder" | "preview"
  setMobilePanel: (panel: "builder" | "preview") => void

  validationRevealed: boolean
  revealValidation: () => void
  resetValidationFeedback: () => void
}

export const useUIStore = create<UIStoreState>()((set) => ({
  previewFormat: "sql",
  setPreviewFormat: (format) => set({ previewFormat: format }),

  resultsOpen: false,
  toggleResults: () => set((state) => ({ resultsOpen: !state.resultsOpen })),
  openResults: () => set({ resultsOpen: true }),

  lastRun: null,
  lastRunTreeKey: null,
  setLastRun: (tree, result) =>
    set({
      lastRun: result,
      lastRunTreeKey: JSON.stringify(tree),
      resultsOpen: true,
      queryRunning: false,
    }),

  queryRunning: false,
  setQueryRunning: (running) =>
    set((state) => ({
      queryRunning: running,
      resultsOpen: running ? true : state.resultsOpen,
    })),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  mobilePanel: "builder",
  setMobilePanel: (panel) => set({ mobilePanel: panel }),

  validationRevealed: false,
  revealValidation: () => set({ validationRevealed: true }),
  resetValidationFeedback: () => set({ validationRevealed: false }),
}))
