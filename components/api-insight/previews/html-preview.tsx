"use client"

import { useState } from "react"
import { Code, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "../types"

interface HTMLPreviewProps {
  call: APICall
}

export function HTMLPreview({ call }: HTMLPreviewProps) {
  const [showRaw, setShowRaw] = useState(false)
  const htmlContent =
    call.previewData?.html ||
    "<html><body><h1>Sample HTML Response</h1><p>This is a preview of the HTML content.</p></body></html>"

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex gap-2">
        <Button variant={showRaw ? "outline" : "default"} size="sm" onClick={() => setShowRaw(false)} className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button variant={showRaw ? "default" : "outline"} size="sm" onClick={() => setShowRaw(true)} className="gap-2">
          <Code className="h-4 w-4" />
          View Raw Source
        </Button>
      </div>

      {/* Content */}
      {showRaw ? (
        <pre className="rounded-lg border border-border bg-background p-4 text-xs font-mono overflow-auto devtools-scrollbar max-h-[500px]">
          {htmlContent}
        </pre>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <iframe
            srcDoc={htmlContent}
            title="HTML Preview"
            className="w-full h-[500px] bg-white"
            sandbox="allow-same-origin"
          />
        </div>
      )}
    </div>
  )
}
