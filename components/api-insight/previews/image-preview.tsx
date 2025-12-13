import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "../types"

interface ImagePreviewProps {
  call: APICall
}

export function ImagePreview({ call }: ImagePreviewProps) {
  const imageUrl = call.previewData?.url || "/api-response-image.jpg"
  const metadata = call.previewData?.metadata || {
    dimensions: "800 × 600",
    mimeType: call.contentType,
    size: `${(call.responseSize / 1024).toFixed(1)} KB`,
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `image_${Date.now()}.${metadata.mimeType?.split('/')[1] || 'png'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Image Preview */}
      <div className="flex items-center justify-center rounded-lg border border-border bg-secondary/30 p-4 min-h-[400px]">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Response preview"
          className="max-w-full max-h-[500px] object-contain rounded"
        />
      </div>

      {/* Metadata */}
      <div className="flex gap-6 text-xs text-muted-foreground">
        <div>
          <span className="uppercase tracking-wide">Dimensions:</span>{" "}
          <span className="text-foreground font-mono">{metadata.dimensions}</span>
        </div>
        <div>
          <span className="uppercase tracking-wide">MIME Type:</span>{" "}
          <span className="text-foreground font-mono">{metadata.mimeType}</span>
        </div>
        <div>
          <span className="uppercase tracking-wide">Size:</span>{" "}
          <span className="text-foreground font-mono">{metadata.size}</span>
        </div>
      </div>
    </div>
  )
}
