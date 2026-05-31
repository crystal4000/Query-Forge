import { create } from "zustand"
import type { PreviewFormat } from "@/lib/query-engine/types"

interface UIStoreState {
  previewFormat: PreviewFormat
  setPreviewFormat: (format: PreviewFormat) => void
}

export const useUIStore = create<UIStoreState>()((set) => ({
  previewFormat: "sql",
  setPreviewFormat: (format) => set({ previewFormat: format }),
}))
