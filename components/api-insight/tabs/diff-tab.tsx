import type React from "react"
import type { APICall } from "../types"

interface DiffTabProps {
  currentCall: APICall
  previousCall: APICall
}

type DiffResult = {
  key: string
  type: "added" | "removed" | "changed" | "unchanged"
  oldValue?: unknown
  newValue?: unknown
  children?: DiffResult[]
}

export function DiffTab({ currentCall, previousCall }: DiffTabProps) {
  const computeDiff = (oldObj: unknown, newObj: unknown, path = ""): DiffResult[] => {
    const results: DiffResult[] = []

    if (typeof oldObj !== "object" || typeof newObj !== "object" || oldObj === null || newObj === null) {
      if (oldObj !== newObj) {
        return [{ key: path || "value", type: "changed", oldValue: oldObj, newValue: newObj }]
      }
      return [{ key: path || "value", type: "unchanged", oldValue: oldObj, newValue: newObj }]
    }

    const oldKeys = Object.keys(oldObj as Record<string, unknown>)
    const newKeys = Object.keys(newObj as Record<string, unknown>)
    const allKeys = new Set([...oldKeys, ...newKeys])

    allKeys.forEach((key) => {
      const oldVal = (oldObj as Record<string, unknown>)[key]
      const newVal = (newObj as Record<string, unknown>)[key]

      if (!(key in (oldObj as Record<string, unknown>))) {
        results.push({ key, type: "added", newValue: newVal })
      } else if (!(key in (newObj as Record<string, unknown>))) {
        results.push({ key, type: "removed", oldValue: oldVal })
      } else if (typeof oldVal === "object" && typeof newVal === "object" && oldVal !== null && newVal !== null) {
        const children = computeDiff(oldVal, newVal, `${path}.${key}`)
        const hasChanges = children.some((c) => c.type !== "unchanged")
        results.push({
          key,
          type: hasChanges ? "changed" : "unchanged",
          children,
        })
      } else if (oldVal !== newVal) {
        results.push({ key, type: "changed", oldValue: oldVal, newValue: newVal })
      } else {
        results.push({ key, type: "unchanged", oldValue: oldVal, newValue: newVal })
      }
    })

    return results
  }

  const diff = computeDiff(previousCall.responseBody, currentCall.responseBody)
  const hasChanges = diff.some((d) => d.type !== "unchanged")

  const renderDiffItem = (item: DiffResult, level = 0): React.ReactNode => {
    const indent = level * 16

    const getStyle = (type: string) => {
      switch (type) {
        case "added":
          return "bg-diff-added text-green-400"
        case "removed":
          return "bg-diff-removed text-red-400"
        case "changed":
          return "bg-diff-changed text-yellow-400"
        default:
          return "text-foreground"
      }
    }

    return (
      <div key={item.key} style={{ marginLeft: indent }}>
        <div className={`rounded px-2 py-0.5 ${getStyle(item.type)}`}>
          <span className="font-semibold">{item.key}</span>
          {item.type === "added" && (
            <span className="ml-2">
              + <span className="text-green-300">{JSON.stringify(item.newValue)}</span>
            </span>
          )}
          {item.type === "removed" && (
            <span className="ml-2">
              - <span className="text-red-300">{JSON.stringify(item.oldValue)}</span>
            </span>
          )}
          {item.type === "changed" && !item.children && (
            <span className="ml-2">
              <span className="text-red-300 line-through">{JSON.stringify(item.oldValue)}</span>
              {" → "}
              <span className="text-green-300">{JSON.stringify(item.newValue)}</span>
            </span>
          )}
        </div>
        {item.children && item.children.map((child) => renderDiffItem(child, level + 1))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-muted-foreground uppercase tracking-wide">Response Diff (vs previous call)</h3>
        <div className="text-xs text-muted-foreground">
          Previous: {new Date(previousCall.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {!hasChanges ? (
        <div className="rounded-lg border border-border bg-secondary/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">No changes detected between responses</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background p-4 font-mono text-xs overflow-auto devtools-scrollbar max-h-96 space-y-1">
          {diff.filter((d) => d.type !== "unchanged").map((item) => renderDiffItem(item))}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-diff-added" />
          <span className="text-muted-foreground">Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-diff-removed" />
          <span className="text-muted-foreground">Removed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-diff-changed" />
          <span className="text-muted-foreground">Changed</span>
        </div>
      </div>
    </div>
  )
}
