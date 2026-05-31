"use client"

import { useRef, useState, useMemo, useEffect } from "react"
import { useQueryStore, useUndoRedo } from "@/store/query-store"
import { useHistoryStore } from "@/store/history-store"
import { validateTree } from "@/lib/query-engine/validator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Undo2, Redo2, RotateCcw, Download, Upload, Save } from "lucide-react"

export function Toolbar() {
  const { tree, resetTree, setTree } = useQueryStore()
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  const { savePreset } = useHistoryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [importError, setImportError] = useState<string | null>(null)

  const validation = useMemo(() => validateTree(tree), [tree])

  const hasStatus = Boolean(importError) || !validation.valid

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [undo, redo])

  function handleExport() {
    const blob = new Blob([JSON.stringify(tree, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `query-${tree.schemaId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (parsed?.root?.type === "group" && parsed?.schemaId) {
          setTree(parsed)
        } else {
          setImportError("Invalid query file — missing schemaId or root group")
        }
      } catch {
        setImportError("Could not parse JSON file")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  function handleSave() {
    if (!presetName.trim()) return
    savePreset(presetName.trim(), "", tree)
    setPresetName("")
    setSaving(false)
  }

  return (
    <div className="border-b border-border shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-1 px-3 py-2.5 sm:py-2 min-h-11">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 w-full sm:flex-1 sm:min-w-0 sm:overflow-x-auto sm:overscroll-x-contain">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => undo()}
            disabled={!canUndo}
            className="w-7 h-7 shrink-0 text-text-faint hover:text-text-primary disabled:opacity-30"
            aria-label="Undo"
          >
            <Undo2 size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => redo()}
            disabled={!canRedo}
            className="w-7 h-7 shrink-0 text-text-faint hover:text-text-primary disabled:opacity-30"
            aria-label="Redo"
          >
            <Redo2 size={13} />
          </Button>

          <Divider />

          <Button
            variant="ghost"
            size="icon"
            onClick={resetTree}
            className="w-7 h-7 shrink-0 text-text-faint hover:text-text-primary"
            aria-label="Reset query"
          >
            <RotateCcw size={13} />
          </Button>

          <Divider />

          {saving ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Input
                autoFocus
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave()
                  if (e.key === "Escape") setSaving(false)
                }}
                placeholder="preset name..."
                className="h-7 w-28 sm:w-36 text-xs bg-surface border-border"
              />
              <Button
                size="sm"
                onClick={handleSave}
                className="h-7 shrink-0 text-xs bg-accent text-background hover:bg-accent-hover"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSaving(false)}
                className="h-7 shrink-0 text-xs text-text-faint"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaving(true)}
              disabled={!validation.valid}
              className="h-7 shrink-0 text-[11px] text-text-faint hover:text-text-primary gap-1.5 disabled:opacity-30"
              aria-label="Save preset"
            >
              <Save size={12} />
              <span className="hidden min-[400px]:inline">Save</span>
            </Button>
          )}

          <Divider />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="h-7 shrink-0 text-[11px] text-text-faint hover:text-text-primary gap-1.5"
            aria-label="Export query"
          >
            <Download size={12} />
            <span className="hidden min-[400px]:inline">Export</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 shrink-0 text-[11px] text-text-faint hover:text-text-primary gap-1.5"
            aria-label="Import query"
          >
            <Upload size={12} />
            <span className="hidden min-[400px]:inline">Import</span>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {hasStatus && (
          <div className="flex justify-center sm:justify-end w-full sm:w-auto shrink-0 border-t border-border/60 sm:border-0 pt-2.5 sm:pt-0 sm:ml-auto sm:pl-2">
            <ToolbarStatus importError={importError} validation={validation} />
          </div>
        )}
      </div>
    </div>
  )
}

function ToolbarStatus({
  importError,
  validation,
}: {
  importError: string | null
  validation: ReturnType<typeof validateTree>
}) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-center">
      {importError && (
        <span className="text-[11px] font-mono text-red-400 break-words max-w-full">
          {importError}
        </span>
      )}
      {!validation.valid && (
        <span className="text-[11px] font-mono text-red-400">
          {validation.errors.length} error
          {validation.errors.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-0.5 shrink-0" />
}
