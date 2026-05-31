import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { QueryHistoryEntry, SavedPreset, QueryTree } from "@/lib/query-engine/types"

interface HistoryStoreState {
  history: QueryHistoryEntry[]
  presets: SavedPreset[]

  addToHistory: (tree: QueryTree, resultCount: number) => void
  clearHistory: () => void

  savePreset: (name: string, description: string, tree: QueryTree) => void
  deletePreset: (id: string) => void
}

export const useHistoryStore = create<HistoryStoreState>()(
  persist(
    (set) => ({
      history: [],
      presets: [],

      addToHistory: (tree, resultCount) =>
        set((state) => ({
          history: [
            {
              id: nanoid(),
              label: `Query · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              tree,
              resultCount,
              createdAt: new Date().toISOString(),
            },
            ...state.history,
          ].slice(0, 50), // cap at 50 entries
        })),

      clearHistory: () => set({ history: [] }),

      savePreset: (name, description, tree) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              id: nanoid(),
              name,
              description,
              tree,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "qb-history", // localStorage key
    }
  )
)
