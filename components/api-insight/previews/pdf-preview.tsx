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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-3 text-sm font-mono">100%</span>
          <Button variant="outline" size="sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{pageCount} pages</span>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-secondary/30 p-4 min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="w-[400px] h-[500px] bg-white rounded shadow-lg flex items-center justify-center">
            <img
              src={pdfUrl || "/placeholder.svg"}
              alt="PDF Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="text-xs text-muted-foreground">Page 1 of {pageCount}</p>
        </div>
      </div>
    </div>
  )
}
