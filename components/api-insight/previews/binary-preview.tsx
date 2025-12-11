import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "../types"

interface BinaryPreviewProps {
  call: APICall
}

export function BinaryPreview({ call }: BinaryPreviewProps) {
  // Generate fake hex data for preview
  const generateHexData = () => {
    const lines = []
    for (let i = 0; i < 16; i++) {
      const offset = (i * 16).toString(16).padStart(8, "0")
      const hex = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, "0"),
      ).join(" ")
      const ascii = Array.from({ length: 16 }, () => {
        const code = Math.floor(Math.random() * 94) + 33
        return String.fromCharCode(code)
      }).join("")
      lines.push({ offset, hex, ascii })
    }
    return lines
  }

  const hexData = generateHexData()

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="rounded-lg border border-border bg-secondary/30 p-4">
        <p className="text-sm text-muted-foreground">Binary content detected. Unable to preview as text.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Content-Type: {call.contentType} | Size: {(call.responseSize / 1024).toFixed(1)} KB
        </p>
      </div>

      {/* Hex Viewer */}
      <div>
        <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Hex View</h4>
        <div className="rounded-lg border border-border bg-background overflow-auto devtools-scrollbar max-h-80">
          <table className="w-full font-mono text-xs">
            <thead className="bg-secondary/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-muted-foreground">Offset</th>
                <th className="px-3 py-2 text-left text-muted-foreground">Hex</th>
                <th className="px-3 py-2 text-left text-muted-foreground">ASCII</th>
              </tr>
            </thead>
            <tbody>
              {hexData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                  <td className="px-3 py-1 text-muted-foreground">{row.offset}</td>
                  <td className="px-3 py-1">{row.hex}</td>
                  <td className="px-3 py-1 text-green-400">{row.ascii}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Button */}
      <Button variant="outline" className="gap-2 bg-transparent">
        <Download className="h-4 w-4" />
        Download File
      </Button>
    </div>
  )
}
