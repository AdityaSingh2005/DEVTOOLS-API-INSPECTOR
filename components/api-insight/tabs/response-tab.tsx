"use client"

import React, { useState } from "react"
import { Search, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { APICall } from "../types"
import { StatusBadge } from "../status-badge"
import { ImagePreview } from "../previews/image-preview"
import { HTMLPreview } from "../previews/html-preview"
import { PDFPreview } from "../previews/pdf-preview"
import { BinaryPreview } from "../previews/binary-preview"
import { JsonViewer } from "../json-viewer"
import { PreviewType } from "../content-preview"

interface ResponseTabProps {
  call: APICall
  searchQuery: string
  onPreview: (type: PreviewType, content: string) => void
}

export function ResponseTab({ call, searchQuery, onPreview }: ResponseTabProps) {
  const [jsonSearch, setJsonSearch] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      const textToCopy = typeof call.responseBody === 'object' && call.responseBody !== null
        ? JSON.stringify(call.responseBody, null, 2)
        : String(call.responseBody)

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy)
      } else {
        // Fallback for older browsers or restricted contexts
        const textArea = document.createElement("textarea")
        textArea.value = textToCopy
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err)
        }
        document.body.removeChild(textArea)
      }

      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  const renderPreview = () => {
    const contentType = call.contentType.toLowerCase()

    if (contentType.includes("image/") || call.responseType === "image") {
      return <ImagePreview call={call} />
    }

    if (contentType.includes("text/html") || call.responseType === "html") {
      return <HTMLPreview call={call} />
    }

    if (contentType.includes("application/pdf") || call.responseType === "pdf") {
      return <PDFPreview call={call} />
    }

    if (call.responseType === "binary") {
      return <BinaryPreview call={call} />
    }

    // Default: JSON viewer
    return (
      <div className="space-y-3">
        {/* JSON Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search in JSON..."
            value={jsonSearch}
            onChange={(e) => setJsonSearch(e.target.value)}
            className="h-8 bg-secondary/50 pl-9 font-mono text-sm"
          />
        </div>

        <JsonViewer
          data={call.responseBody}
          searchQuery={jsonSearch || searchQuery}
          onPreview={onPreview}
        />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Headers Removed per user request */}

      {/* Status & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <StatusBadge status={call.status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Time:</span>
          <span className="font-mono text-xs">{call.duration}ms</span>
        </div>
      </div>

      {/* Response Body Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wide">Response Body</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy} title="Copy Response">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {renderPreview()}
      </div>
    </div>
  )
}
