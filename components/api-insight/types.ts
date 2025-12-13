export interface WSFrame {
  id: string
  data: string
  type: "send" | "receive"
  timestamp: number
}

export interface APICall {
  id: string
  url: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "WS"
  status: number // Use 101 for WS
  duration: number // Duration open?
  timestamp: number
  requestHeaders: Record<string, string>
  responseHeaders: Record<string, string>
  requestBody: Record<string, unknown>
  responseBody: unknown | WSFrame[] // For WS, this will hold the frames
  requestSize: number
  responseSize: number
  contentType: string
  initiator?: string
  responseType?: "json" | "image" | "html" | "pdf" | "binary" | "ws"
  previewData?: {
    url?: string
    html?: string
    pageCount?: number
    metadata?: {
      dimensions?: string
      mimeType?: string
      size?: string
    }
  }
}

export interface Session {
  id: string
  timestamp: number
  logs: APICall[]
  isOpen: boolean
}
