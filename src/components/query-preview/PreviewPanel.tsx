"use client"

import { useMemo, useState } from "react"
import { useQueryStore } from "@/store/query-store"
import { useUIStore } from "@/store/ui-store"
import { generateQuery } from "@/lib/query-engine/generator"
import { validateTree } from "@/lib/query-engine/validator"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import type { PreviewFormat } from "@/lib/query-engine/types"

const TABS: { label: string; value: PreviewFormat }[] = [
  { label: "SQL", value: "sql" },
  { label: "Mongo", value: "mongo" },
  { label: "JSON", value: "json" },
]

export function PreviewPanel() {
  const tree = useQueryStore((s) => s.tree)
  const { previewFormat, setPreviewFormat } = useUIStore()
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => generateQuery(tree, previewFormat), [tree, previewFormat])

  const previewText = useMemo(() => {
    if (output.format === "sql") return output.query
    if (output.format === "mongo") return JSON.stringify(output.filter, null, 2)
    if (output.format === "json") return JSON.stringify(output.tree, null, 2)
    return ""
  }, [output])

  const validation = useMemo(() => validateTree(tree), [tree])

  async function handleCopy() {
    await navigator.clipboard.writeText(previewText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <aside className="w-72 bg-surface/30 border-l border-border flex flex-col shrink-0 overflow-hidden">
      <div className="flex border-b border-border shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPreviewFormat(tab.value)}
            className={`flex-1 py-2.5 text-[11px] font-mono transition-colors border-b-2
              ${
                previewFormat === tab.value
                  ? "text-accent border-accent"
                  : "text-text-faint border-transparent hover:text-text-muted"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto relative group">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity text-text-faint hover:text-text-primary z-10"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
        </Button>

        <pre className="p-4 text-[11px] font-mono leading-relaxed text-text-muted whitespace-pre-wrap break-words">
          <SyntaxHighlight text={previewText} format={previewFormat} />
        </pre>
      </div>

      <div className="border-t border-border p-3 shrink-0">
        <span className="text-[11px] font-mono text-text-faint">
          {!validation.valid ? (
            <span className="text-red-400">
              {validation.errors.length} error
              {validation.errors.length !== 1 ? "s" : ""}
            </span>
          ) : (
            "ready"
          )}
        </span>
      </div>
    </aside>
  )
}

function SyntaxHighlight({ text, format }: { text: string; format: PreviewFormat }) {
  if (format === "sql") return <SQLHighlight text={text} />
  return <JSONHighlight text={text} />
}

function SQLHighlight({ text }: { text: string }) {
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "NOT",
    "IN",
    "IS",
    "NULL",
    "LIKE",
    "BETWEEN",
    "REGEXP",
  ]
  const parts = text.split(
    /(\b(?:SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|REGEXP)\b|'[^']*'|\d+)/g
  )

  return (
    <>
      {parts.map((part, i) => {
        if (keywords.includes(part))
          return (
            <span key={i} className="text-accent">
              {part}
            </span>
          )
        if (/^'.*'$/.test(part))
          return (
            <span key={i} className="text-yellow-400">
              {part}
            </span>
          )
        if (/^\d+$/.test(part))
          return (
            <span key={i} className="text-orange-400">
              {part}
            </span>
          )
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function JSONHighlight({ text }: { text: string }) {
  const parts = text.split(/("(?:[^"\\]|\\.)*")\s*(:)?|(\b\d+\.?\d*\b)|(true|false|null)/g)

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null
        if (/^".*":$/.test(part + (parts[i + 1] === ":" ? ":" : "")))
          return (
            <span key={i} className="text-blue-400">
              {part}
            </span>
          )
        if (/^"/.test(part))
          return (
            <span key={i} className="text-yellow-400">
              {part}
            </span>
          )
        if (/^\d/.test(part))
          return (
            <span key={i} className="text-orange-400">
              {part}
            </span>
          )
        if (part === "true" || part === "false")
          return (
            <span key={i} className="text-purple-400">
              {part}
            </span>
          )
        if (part === "null")
          return (
            <span key={i} className="text-text-faint">
              {part}
            </span>
          )
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
