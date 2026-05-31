"use client"

import { useQueryStore } from "@/store/query-store"
import { useHistoryStore } from "@/store/history-store"
import { useUIStore } from "@/store/ui-store"
import { SCHEMAS } from "@/lib/schema/schema"
import { Button } from "@/components/ui/button"
import {
  Users,
  ShoppingCart,
  Box,
  Bookmark,
  Clock,
  Trash2,
  BookmarkX,
  History,
  X,
} from "lucide-react"
import { EmptyState } from "@/components/ui/state-placeholder"
import type { Schema } from "@/lib/query-engine/types"
import { cn } from "@/lib/utils"

const SCHEMA_ICONS: Record<string, React.ReactNode> = {
  users: <Users size={13} />,
  orders: <ShoppingCart size={13} />,
  products: <Box size={13} />,
}

const TYPE_COLORS: Record<string, string> = {
  string: "text-blue-400",
  number: "text-orange-400",
  boolean: "text-purple-400",
  date: "text-pink-400",
  enum: "text-accent",
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <>
      <aside className="hidden lg:flex w-56 bg-surface/50 border-r border-border flex-col overflow-hidden shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-[min(16rem,85vw)]",
              "bg-surface border-r border-border flex flex-col overflow-hidden lg:hidden"
            )}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-[10px] font-medium text-text-faint uppercase tracking-widest">
                Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 text-text-faint"
                aria-label="Close menu"
              >
                <X size={14} />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { tree, setSchema, setTree } = useQueryStore()
  const { presets, history, deletePreset } = useHistoryStore()

  const activeSchema = SCHEMAS.find((s) => s.id === tree.schemaId)

  function handleSchemaChange(schemaId: string) {
    setSchema(schemaId)
    onNavigate?.()
  }

  function handleLoadTree(tree: Parameters<typeof setTree>[0]) {
    setTree(tree)
    onNavigate?.()
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Section label="Data Sources">
        {SCHEMAS.map((schema: Schema) => (
          <SidebarItem
            key={schema.id}
            icon={SCHEMA_ICONS[schema.id]}
            label={schema.name}
            active={tree.schemaId === schema.id}
            onClick={() => handleSchemaChange(schema.id)}
          />
        ))}
      </Section>

      {activeSchema && (
        <Section label="Schema">
          <div className="px-4 pb-1">
            {activeSchema.fields.map((field) => (
              <div key={field.key} className="flex items-center justify-between py-1 gap-2">
                <span className="text-[11px] text-text-muted font-mono truncate">{field.key}</span>
                <span
                  className={`text-[10px] font-mono shrink-0 ${TYPE_COLORS[field.type] ?? "text-text-faint"}`}
                >
                  {field.type}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section label="Saved Queries">
        {presets.length === 0 ? (
          <EmptyState
            compact
            icon={<BookmarkX size={14} strokeWidth={1.5} />}
            title="No saved queries yet"
          />
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-2 px-3 py-1.5 group hover:bg-surface cursor-pointer"
              onClick={() => handleLoadTree(preset.tree)}
            >
              <Bookmark size={12} className="text-text-faint shrink-0" />
              <span className="text-[12px] text-text-muted flex-1 truncate">{preset.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 opacity-0 group-hover:opacity-100 text-text-faint hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation()
                  deletePreset(preset.id)
                }}
              >
                <Trash2 size={10} />
              </Button>
            </div>
          ))
        )}
      </Section>

      <Section label="History">
        {history.length === 0 ? (
          <EmptyState
            compact
            icon={<History size={14} strokeWidth={1.5} />}
            title="Run a query to build history"
          />
        ) : (
          history.slice(0, 10).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-3 py-1.5 group hover:bg-surface cursor-pointer"
              onClick={() => handleLoadTree(entry.tree)}
            >
              <Clock size={12} className="text-text-faint shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-muted truncate">{entry.label}</p>
                <p className="text-[10px] text-text-faint font-mono">{entry.resultCount} rows</p>
              </div>
            </div>
          ))
        )}
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-border last:border-0">
      <p className="text-[10px] font-medium text-text-faint uppercase tracking-widest px-4 mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] font-mono transition-colors
        ${
          active
            ? "text-text-primary bg-surface border-r-2 border-r-accent"
            : "text-text-muted hover:text-text-primary hover:bg-surface/50"
        }
      `}
    >
      <span className={active ? "text-accent" : "text-text-faint"}>{icon}</span>
      {label}
    </button>
  )
}
