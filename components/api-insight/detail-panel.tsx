"use client"

import { useState } from "react"
import { X, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "./types"
import { StatusBadge } from "./status-badge"
import { OverviewTab } from "./tabs/overview-tab"
import { RequestTab } from "./tabs/request-tab"
import { ResponseTab } from "./tabs/response-tab"
import { ContentPreview, PreviewType } from "./content-preview"
import { ReplayModal } from "./replay-modal"

interface DetailPanelProps {
  call: APICall
  allCalls: APICall[]
  onClose: () => void
  searchQuery: string
}

export function DetailPanel({ call, allCalls, onClose, searchQuery }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "request" | "response">("response")
  const [previewData, setPreviewData] = useState<{ type: PreviewType; content: string } | null>(null)
  const [showReplay, setShowReplay] = useState(false)

  return (
    <div className="flex h-full flex-col bg-card relative">
      {/* Header with Actions */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={call.status} />
          <span className="font-mono text-xs font-medium">{call.method}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={call.url}>
            {call.url}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowReplay(true)} title="Replay Request">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card px-2">
        {(["overview", "request", "response"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${activeTab === tab
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === "overview" && <OverviewTab call={call} />}
        {activeTab === "request" && <RequestTab call={call} />}
        {activeTab === "response" && (
          <ResponseTab
            call={call}
            searchQuery={searchQuery}
            onPreview={(type, content) => setPreviewData({ type, content })}
          />
        )}
      </div>

      {previewData && (
        <ContentPreview
          type={previewData.type}
          content={previewData.content}
          onClose={() => setPreviewData(null)}
        />
      )}

      {showReplay && (
        <ReplayModal
          call={call}
          onClose={() => setShowReplay(false)}
        />
      )}
    </div>
  )
}
