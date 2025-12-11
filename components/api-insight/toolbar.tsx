"use client"

import { Search, X, CircleX, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ToolbarProps {
  timeWindow: string
  onTimeWindowChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  showOnlyErrors: boolean
  onShowOnlyErrorsChange: (value: boolean) => void
  hasSelection: boolean
  onToggleSettings?: () => void
  onClearLogs?: () => void
}

export function Toolbar({
  timeWindow,
  onTimeWindowChange,
  searchQuery,
  onSearchChange,
  showOnlyErrors,
  onShowOnlyErrorsChange,
  hasSelection,
  onToggleSettings,
  onClearLogs,
}: ToolbarProps) {
  const timeWindows = ["30s", "1m", "5m", "15m", "all"]

  return (
    <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-2">
      {/* Clear Logs Button (User Request) */}
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onClearLogs} title="Clear Logs">
        <CircleX className="h-5 w-5" />
      </Button>

      {/* Time Window Selector */}
      <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-0.5">
        {timeWindows.map((tw) => (
          <button
            key={tw}
            onClick={() => onTimeWindowChange(tw)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${timeWindow === tw ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {tw}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Global Search */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter requests (url, method, status...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-full bg-secondary/50 pl-8 text-xs"
        />
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Filters & Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox id="errors" checked={showOnlyErrors} onCheckedChange={(checked) => onShowOnlyErrorsChange(!!checked)} />
          <label htmlFor="errors" className="text-xs text-muted-foreground">
            Errors only
          </label>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSettings}
          title="Settings"
          className="h-8 w-8 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
