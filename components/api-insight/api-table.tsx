"use client"

import { Eye, RefreshCw, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall, Session } from "./types"
import { StatusBadge } from "./status-badge"
import { HighlightText } from "./highlight-text"

interface APITableProps {
  sessions: Session[]
  selectedCall: APICall | null
  onSelectCall: (call: APICall) => void
  onReplay: (call: APICall) => void
  onToggleSession: (sessionId: string) => void
  searchQuery: string
}

export function APITable({ sessions, selectedCall, onSelectCall, onReplay, onToggleSession, searchQuery }: APITableProps) {
  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const truncateUrl = (url: string, maxLength = 60) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + "…"
  }

  return (
    <div className="h-full overflow-auto devtools-scrollbar">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card border-b border-border">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Method</th>
            <th className="px-4 py-2 font-medium">URL</th>
            <th className="px-4 py-2 font-medium text-right">Duration</th>
            <th className="px-4 py-2 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {/* Current Session Stats (Subheader for current logs) */}
          {sessions.length > 0 && sessions[0].logs.length > 0 && (
            <tr className="bg-muted/30 border-b border-border">
              <td colSpan={5} className="px-4 py-1.5 text-xs font-mono text-muted-foreground/70">
                Current Session: {sessions[0].logs.length} reqs |
                Images: {sessions[0].logs.filter(l => l.responseType === 'image' || l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length} |
                Others: {sessions[0].logs.filter(l => l.responseType !== 'image' && !l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length}
              </td>
            </tr>
          )}

          {sessions.map((session) => (
            <>
              {/* Session Header */}
              {/* Only show header if there are multiple sessions or if it's not the initial empty one? User said "show a partition... create when i refresh" */}
              {/* "you don't have to give heading to the current logs" - Wait. "only the current one will be always open - you don't have to give heading to the current logs".
                  If I have 2 sessions: [Current (open), Old (closed)].
                  Should I hide header for Current?
                  If I hide header, I can't collapse it? But user said "current one will be always open".
                  So maybe current session is just the rows, and old sessions are headers?
                  But "partition with a heading... create when i refresh... segregate logs".
                  If I refresh, the *new* one is current. The *old* one becomes old.
                  So the *old* one needs a header "Refreshed at...".
                  The *current* one (top most) maybe doesn't need a header?
                  Let's try to follow: "you don't have to give heading to the current logs".
                  So for index === 0 (current session), no header?
                  But then how is it separated from the one below it if the one below it has a header?
                  Yes, the header of the *next* session acts as separator.
                  
                  Let's render header for all *except* maybe the first one if user insists?
                  "partition with a heading... which should create when i refresh... separate logs from before and after".
                  "only the current one will be always open - you don't have to give heading to the current logs".
                  
                  Okay, so:
                  Session 0 (Current): No Header. Just rows.
                  Session 1 (Old): Header "Refreshed at ...". Collapsed by default (handled by state).
                  
                  But wait, if I have Logs, then Header, then Logs. That looks fine.
               */}
              {sessions.length > 1 && session.id !== sessions[0].id && (
                <tr className="bg-muted/50 border-b border-border">
                  <td colSpan={5} className="px-4 py-1.5 text-xs font-medium text-muted-foreground">
                    <button
                      onClick={() => onToggleSession(session.id)}
                      className="flex items-center gap-2 hover:text-foreground transition-colors w-full text-left"
                    >
                      {session.isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <div className="flex items-center gap-4 flex-1">
                        <span>Refreshed at {new Date(session.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>

                        {/* Closed State Stats */}
                        {!session.isOpen && (
                          <span className="ml-auto font-mono text-[10px] opacity-70">
                            {session.logs.length} reqs
                            ({session.logs.filter(l => l.responseType === 'image' || l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length} img,
                            {session.logs.filter(l => l.responseType !== 'image' && !l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length} other)
                          </span>
                        )}
                      </div>
                    </button>
                    {/* Open State Stats (Subtitle) */}
                    {session.isOpen && (
                      <div className="ml-6 mt-1 font-mono text-[10px] text-muted-foreground/70">
                        Total: {session.logs.length} |
                        Images: {session.logs.filter(l => l.responseType === 'image' || l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length} |
                        Others: {session.logs.filter(l => l.responseType !== 'image' && !l.url.match(/\.(png|jpg|svg|gif|webp)/i)).length}
                      </div>
                    )}
                  </td>
                </tr>
              )}

              {(session.isOpen || session.id === sessions[0].id) && session.logs.map((call, index) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call)}
                  className={`cursor-pointer border-b border-border/50 transition-colors ${selectedCall?.id === call.id ? "bg-accent" : index % 2 === 0 ? "bg-card" : "bg-secondary/30"
                    } hover:bg-accent/70`}
                >
                  <td className="px-4 py-2">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-4 py-2">
                    <span className={`font-mono text-xs font-semibold ${getMethodColor(call.method)}`}>{call.method}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs" title={call.url}>
                    <HighlightText text={truncateUrl(call.url)} highlight={searchQuery} />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">{call.duration}ms</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{formatTimestamp(call.timestamp)}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getMethodColor(method: string): string {
  switch (method) {
    case "GET":
      return "text-green-400"
    case "POST":
      return "text-blue-400"
    case "PUT":
      return "text-yellow-400"
    case "PATCH":
      return "text-orange-400"
    case "DELETE":
      return "text-red-400"
    default:
      return "text-muted-foreground"
  }
}
