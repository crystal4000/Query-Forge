"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, Plus, FolderPlus, Trash2 } from "lucide-react"
import { LogicToggle } from "./LogicToggle"
import { useQueryStore } from "@/store/query-store"
import type { ConditionGroup as ConditionGroupType } from "@/lib/query-engine/types"

const DndConditionList = dynamic(
  () =>
    import("./DndConditionList").then((mod) => ({
      default: mod.DndConditionList,
    })),
  { ssr: false }
)

const DEPTH_BORDER_COLORS = ["#3ecf8e", "#2dd4a0", "#22c4b0", "#1ab4bc"]

const DEPTH_BACKGROUNDS = [
  "rgba(62, 207, 142, 0.04)",
  "rgba(45, 212, 160, 0.06)",
  "rgba(34, 196, 176, 0.08)",
  "rgba(26, 180, 188, 0.10)",
]

interface ConditionGroupProps {
  group: ConditionGroupType
  schemaId: string
  depth?: number
  isRoot?: boolean
  errorIds: Set<string>
}

export function ConditionGroup({
  group,
  schemaId,
  depth = 0,
  isRoot = false,
  errorIds,
}: ConditionGroupProps) {
  const { addRule, addGroup, removeNode, toggleGroupLogic, toggleGroupCollapsed } = useQueryStore()

  const hasError = errorIds.has(group.id)

  return (
    <div
      style={{
        borderLeftColor: DEPTH_BORDER_COLORS[Math.min(depth, DEPTH_BORDER_COLORS.length - 1)],
        backgroundColor: DEPTH_BACKGROUNDS[Math.min(depth, DEPTH_BACKGROUNDS.length - 1)],
      }}
      className={`
    border-l-2 rounded-r-lg
    ${hasError ? "ring-1 ring-red-500/30" : ""}
    ${depth > 0 ? "ml-3 sm:ml-6" : ""}
    p-3 mb-3
  `}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 text-text-faint hover:text-text-muted"
          onClick={() => toggleGroupCollapsed(group.id)}
          aria-label={group.collapsed ? "Expand group" : "Collapse group"}
        >
          {group.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </Button>

        <LogicToggle value={group.logic} onChange={() => toggleGroupLogic(group.id)} />

        <span className="text-[11px] text-text-faint">
          {group.children.length} condition
          {group.children.length !== 1 ? "s" : ""}
        </span>

        {hasError && <span className="text-[10px] text-red-400 font-mono">incomplete</span>}

        {!isRoot && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeNode(group.id)}
            className="w-5 h-5 ml-auto text-text-faint hover:text-red-400"
            aria-label="Remove group"
          >
            <Trash2 size={11} />
          </Button>
        )}
      </div>

      {!group.collapsed && (
        <DndConditionList group={group} schemaId={schemaId} depth={depth} errorIds={errorIds} />
      )}

      {!group.collapsed && (
        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addRule(group.id)}
            className="h-7 text-[11px] text-text-faint hover:text-accent hover:bg-accent-muted gap-1"
          >
            <Plus size={11} />
            rule
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => addGroup(group.id)}
            className="h-7 text-[11px] text-text-faint hover:text-accent hover:bg-accent-muted gap-1"
          >
            <FolderPlus size={11} />
            group
          </Button>
        </div>
      )}
    </div>
  )
}
