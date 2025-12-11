"use client"

import { useState, useMemo } from "react"
import { Toolbar } from "./toolbar"
import { APITable } from "./api-table"
import { DetailPanel } from "./detail-panel"
import { ReplayPanel } from "./replay-panel"
import { EmptyState } from "./empty-state"
import type { APICall } from "./types"
import { useNetworkMonitor } from "@/hooks/use-network-monitor"
import { SettingsPanel, type SettingsState } from "./settings-panel"

export function APIInsightPanel() {
  const [timeWindow, setTimeWindow] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyErrors, setShowOnlyErrors] = useState(false)
  const [selectedCall, setSelectedCall] = useState<APICall | null>(null)

  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<SettingsState>({
    hideStaticAssets: true,
    hideFrameworkInternals: true,
    hideThirdParty: true,
    hidePreflight: true
  })

  // Resize State
  const [panelWidth, setPanelWidth] = useState(600) // Default width in pixels
  const [isResizing, setIsResizing] = useState(false)

  const { sessions, isCapturing, setIsCapturing, clearLogs, toggleSession } = useNetworkMonitor()

  // Filter logs within sessions
  const filteredSessions = useMemo(() => {
    return sessions.map(session => {
      const filteredLogs = session.logs.filter((call) => {
        // Time window filter
        if (timeWindow !== "all") {
          const now = Date.now()
          const windowMs = {
            "30s": 30 * 1000,
            "1m": 60 * 1000,
            "5m": 5 * 60 * 1000,
            "15m": 15 * 60 * 1000,
          }[timeWindow]
          if (windowMs && now - call.timestamp > windowMs) return false
        }

        // Error filter
        if (showOnlyErrors && call.status < 400 && call.status !== 0) return false

        // Settings Filters
        const url = call.url.toLowerCase()

        // Hide Static Assets
        if (settings.hideStaticAssets) {
          if (/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)($|\?)/.test(url)) return false
        }

        // Hide Framework Internals - Aggressive check
        if (settings.hideFrameworkInternals) {
          if (url.includes("_next") || url.includes("webpack") || url.includes("hot-update")) return false
        }

        // Hide Third Party
        if (settings.hideThirdParty) {
          if (url.includes("google-analytics") || url.includes("segment.io") || url.includes("facebook") || url.includes("doubleclick") || url.includes("clerk")) return false
        }

        // Hide Preflight
        if (settings.hidePreflight) {
          if (call.method === "OPTIONS") return false
        }

        // Search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            call.url.toLowerCase().includes(query) ||
            call.method.toLowerCase().includes(query) ||
            JSON.stringify(call.requestHeaders).toLowerCase().includes(query) ||
            JSON.stringify(call.responseHeaders).toLowerCase().includes(query) ||
            (call.requestBody && JSON.stringify(call.requestBody).toLowerCase().includes(query)) ||
            (call.responseBody && JSON.stringify(call.responseBody).toLowerCase().includes(query))
          )
        }

        return true
      })

      return { ...session, logs: filteredLogs }
    }).filter(session => session.logs.length > 0 || (sessions.length > 0 && session.id === sessions[0].id)) // Always keep the active (first) session visible if it's the current one? Or maybe just hide if empty? User probably wants to see current session even if empty.
  }, [sessions, timeWindow, showOnlyErrors, searchQuery, settings]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = panelWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX
      setPanelWidth(Math.max(300, Math.min(window.innerWidth - 300, startWidth + delta)))
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }


  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Toolbar
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showOnlyErrors={showOnlyErrors}
        onShowOnlyErrorsChange={setShowOnlyErrors}
        hasSelection={!!selectedCall}
        onClearLogs={clearLogs}
        onToggleSettings={() => {
          setShowSettings(!showSettings)
          setSelectedCall(null) // Clear selection when toggling settings
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {showSettings ? (
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <>
            {/* Left Panel: List */}
            <div className="flex-1 overflow-hidden transition-all text-sm">
              {filteredSessions.length > 0 ? (
                <APITable
                  sessions={filteredSessions}
                  selectedCall={selectedCall}
                  onSelectCall={setSelectedCall}
                  onReplay={(call) => console.log("Replay specific", call)}
                  onToggleSession={toggleSession}
                  searchQuery={searchQuery}
                />
              ) : (
                <EmptyState isCapturing={isCapturing} />
              )}
            </div>

            {/* Right Panel: Details */}
            {selectedCall && (
              <div
                className="overflow-hidden border-l border-border bg-card relative shadow-xl z-10 flex flex-col"
                style={{ width: `${panelWidth}px`, minWidth: "300px" }}
              >
                {/* Drag Handle */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary z-20 transition-colors"
                  onMouseDown={startResizing}
                />

                <div className="flex-1 overflow-hidden">
                  <DetailPanel
                    call={selectedCall}
                    allCalls={sessions.flatMap(s => s.logs)}
                    onClose={() => setSelectedCall(null)}
                    searchQuery={searchQuery}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
