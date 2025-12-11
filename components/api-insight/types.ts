export interface APICall {
  id: string
  url: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"
  status: number
  duration: number
  timestamp: number
  requestHeaders: Record<string, string>
  responseHeaders: Record<string, string>
  requestBody: Record<string, unknown>
  responseBody: unknown
  requestSize: number
  responseSize: number
  contentType: string
  initiator?: string
  responseType?: "json" | "image" | "html" | "pdf" | "binary"
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
