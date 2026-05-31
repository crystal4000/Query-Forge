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

  const validation = useMemo(() => validateTree(tree), [tree])

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

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        // basic sanity check before loading
        if (parsed?.root?.type === "group" && parsed?.schemaId) {
          setTree(parsed)
        }
      } catch {
        // invalid JSON — silently ignore
      }
    }
    reader.readAsText(file)
    // reset input so same file can be re-imported
    e.target.value = ""
  }

  function handleSave() {
    if (!presetName.trim()) return
    savePreset(presetName.trim(), "", tree)
    setPresetName("")
    setSaving(false)
  }

  return (
    <div className="h-11 border-b border-border flex items-center gap-1 px-3 shrink-0">
      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => undo()}
        disabled={!canUndo}
        className="w-7 h-7 text-text-faint hover:text-text-primary disabled:opacity-30"
        aria-label="Undo"
      >
        <Undo2 size={13} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => redo()}
        disabled={!canRedo}
        className="w-7 h-7 text-text-faint hover:text-text-primary disabled:opacity-30"
        aria-label="Redo"
      >
        <Redo2 size={13} />
      </Button>

      <Divider />

      {/* Reset */}
      <Button
        variant="ghost"
        size="icon"
        onClick={resetTree}
        className="w-7 h-7 text-text-faint hover:text-text-primary"
        aria-label="Reset query"
      >
        <RotateCcw size={13} />
      </Button>

      <Divider />

      {/* Save preset */}
      {saving ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") setSaving(false)
            }}
            placeholder="preset name..."
            className="h-7 w-36 text-xs bg-surface border-border"
          />
          <Button
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs bg-accent text-background hover:bg-accent-hover"
          >
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSaving(false)}
            className="h-7 text-xs text-text-faint"
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
          className="h-7 text-[11px] text-text-faint hover:text-text-primary gap-1.5 disabled:opacity-30"
        >
          <Save size={12} />
          Save
        </Button>
      )}

      <Divider />

      {/* Export */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        className="h-7 text-[11px] text-text-faint hover:text-text-primary gap-1.5"
      >
        <Download size={12} />
        Export
      </Button>

      {/* Import */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="h-7 text-[11px] text-text-faint hover:text-text-primary gap-1.5"
      >
        <Upload size={12} />
        Import
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Validation status — right side */}
      <div className="ml-auto">
        {!validation.valid && (
          <span className="text-[11px] font-mono text-red-400">
            {validation.errors.length} error
            {validation.errors.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-border mx-1" />
}
