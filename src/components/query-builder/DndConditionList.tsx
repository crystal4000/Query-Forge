"use client"

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { useQueryStore } from "@/store/query-store"
import { isConditionRule, isConditionGroup } from "@/lib/query-engine/types"
import type { ConditionGroup as ConditionGroupType, QueryNode } from "@/lib/query-engine/types"
import { ConditionRule } from "./ConditionRule"
import { ConditionGroup } from "./ConditionGroup"
import { EmptyState } from "@/components/ui/state-placeholder"
import { ListFilter } from "lucide-react"

interface DndConditionListProps {
  group: ConditionGroupType
  schemaId: string
  depth: number
  errorIds: Set<string>
}

export function DndConditionList({ group, schemaId, depth, errorIds }: DndConditionListProps) {
  const { reorderChildren } = useQueryStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = group.children.findIndex((c) => c.id === active.id)
    const newIndex = group.children.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(group.children, oldIndex, newIndex)
    reorderChildren(group.id, reordered)
  }

  const childIds = group.children.map((c) => c.id)

  if (group.children.length === 0) {
    return (
      <EmptyState
        icon={<ListFilter size={18} strokeWidth={1.5} />}
        title="No conditions in this group"
        description="Add a rule or nested group below."
        className="py-4"
      />
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {group.children.map((child: QueryNode) => {
            if (isConditionRule(child)) {
              return (
                <ConditionRule
                  key={child.id}
                  rule={child}
                  schemaId={schemaId}
                  errorIds={errorIds}
                />
              )
            }
            if (isConditionGroup(child)) {
              return (
                <ConditionGroup
                  key={child.id}
                  group={child}
                  schemaId={schemaId}
                  depth={depth + 1}
                  errorIds={errorIds}
                />
              )
            }
            return null
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
