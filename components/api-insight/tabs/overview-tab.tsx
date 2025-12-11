import type { APICall } from "../types"
import { StatusBadge } from "../status-badge"

interface OverviewTabProps {
  call: APICall
}

export function OverviewTab({ call }: OverviewTabProps) {
  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString()
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="p-4 space-y-4">
      {/* URL Card */}
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">URL</label>
        <p className="mt-1 font-mono text-sm break-all select-all">{call.url}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Method</label>
          <p className="mt-1 font-mono text-sm font-semibold">{call.method}</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
          <div className="mt-1">
            <StatusBadge status={call.status} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Duration</label>
          <p className="mt-1 font-mono text-sm">{call.duration}ms</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Timestamp</label>
          <p className="mt-1 font-mono text-sm">{formatTimestamp(call.timestamp)}</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Request Size</label>
          <p className="mt-1 font-mono text-sm">{formatBytes(call.requestSize)}</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Response Size</label>
          <p className="mt-1 font-mono text-sm">{formatBytes(call.responseSize)}</p>
        </div>
      </div>

      {/* Content Type */}
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Content-Type</label>
        <p className="mt-1 font-mono text-sm">{call.contentType}</p>
      </div>

      {/* Initiator / Call Stack */}
      {call.initiator && (
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Initiator / Call Stack</label>
          <pre className="mt-2 rounded bg-background p-3 text-xs font-mono overflow-x-auto devtools-scrollbar">
            {call.initiator}
          </pre>
        </div>
      )}
    </div>
  )
}
