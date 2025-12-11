"use client"

import { useState } from "react"
import { X, Send, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { APICall } from "./types"
import { StatusBadge } from "./status-badge"

interface ReplayPanelProps {
  call: APICall
  onClose: () => void
}

export function ReplayPanel({ call, onClose }: ReplayPanelProps) {
  const [url, setUrl] = useState(call.url)
  const [method, setMethod] = useState(call.method)
  const [headers, setHeaders] = useState(Object.entries(call.requestHeaders).map(([key, value]) => ({ key, value })))
  const [body, setBody] = useState(JSON.stringify(call.requestBody, null, 2))
  const [response, setResponse] = useState<{
    status: number
    time: number
    body: unknown
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }])
  }

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  const sendRequest = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))
    setResponse({
      status: 200,
      time: Math.floor(50 + Math.random() * 200),
      body: {
        success: true,
        message: "Request replayed successfully",
        timestamp: new Date().toISOString(),
        data: { id: 1, name: "Test Response" },
      },
    })
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-lg border border-border bg-card shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Replay Request</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto devtools-scrollbar p-4 space-y-4">
          {/* URL and Method */}
          <div className="flex gap-2">
            <Select value={method} onValueChange={(value) => setMethod(value as APICall["method"])}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 font-mono text-sm"
              placeholder="Enter URL"
            />
          </div>

          {/* Headers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide">Headers</h3>
              <Button variant="ghost" size="sm" onClick={addHeader} className="h-6 gap-1">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    placeholder="Header name"
                    className="w-1/3 font-mono text-sm"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) => updateHeader(index, "value", e.target.value)}
                    placeholder="Header value"
                    className="flex-1 font-mono text-sm"
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeHeader(index)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Body Editor */}
          {method !== "GET" && (
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Request Body</h3>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-40 rounded-lg border border-border bg-background p-3 font-mono text-sm resize-none devtools-scrollbar focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter JSON body..."
              />
            </div>
          )}

          {/* Send Button */}
          <Button onClick={sendRequest} disabled={isLoading} className="gap-2">
            <Send className="h-4 w-4" />
            {isLoading ? "Sending..." : "Send Request"}
          </Button>

          {/* Response */}
          {response && (
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide">Response</h3>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <StatusBadge status={response.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Time:</span>
                  <span className="font-mono text-xs">{response.time}ms</span>
                </div>
              </div>

              <pre className="rounded-lg border border-border bg-background p-4 text-xs font-mono overflow-auto devtools-scrollbar max-h-48">
                {JSON.stringify(response.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
