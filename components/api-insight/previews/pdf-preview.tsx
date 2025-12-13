"use client"

import { ZoomIn, ZoomOut, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "../types"

interface PDFPreviewProps {
  call: APICall
}

export function PDFPreview({ call }: PDFPreviewProps) {
  const pdfUrl = call.previewData?.url || "/pdf-document-preview.png"
  const pageCount = call.previewData?.pageCount || 12

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `document_${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {/* Zoom controls could be implemented by manipulating iframe scale or just removed for native PDF viewer controls */}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{pageCount} pages</span>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-secondary/30 p-4 min-h-[600px]">
        <iframe
          src={pdfUrl}
          className="w-full h-[600px] border-0 rounded bg-white"
          title="PDF Preview"
        />
      </div>
    </div>
  )
}
