"use client"

import { useState, useEffect } from "react"
import { Play, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { APICall } from "./types"
import { JsonViewer } from "./json-viewer"
import { StatusBadge } from "./status-badge"

interface ReplayModalProps {
    call: APICall
    onClose: () => void
}

export function ReplayModal({ call, onClose }: ReplayModalProps) {
    const [method, setMethod] = useState(call.method)
    const [url, setUrl] = useState(call.url)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (call.requestBody) {
            if (typeof call.requestBody === 'string') {
                setBody(call.requestBody)
            } else {
                setBody(JSON.stringify(call.requestBody, null, 2))
            }
        }
    }, [call])

    const handleSend = async () => {
        setLoading(true)
        setResponse(null)
        setError(null)

        const startTime = Date.now()

        // Filter out unsafe/forbidden headers that browser controls
        const unsafeHeaders = [
            'content-length',
            'host',
            'connection',
            'origin',
            'referer',
            'sec-fetch-dest',
            'sec-fetch-mode',
            'sec-fetch-site',
            'user-agent',
            'cookie',
            'date',
            'dnt',
            'expect',
            'upgrade-insecure-requests',
            'via'
        ]

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        if (call.requestHeaders) {
            // Regex for valid header name (HTTP token)
            const tokenRegex = /^[a-zA-Z0-9!#$%&'*+.^_`|~-]+$/;

            Object.entries(call.requestHeaders).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase()

                // 1. Must not be in unsafe list
                // 2. Must not start with : (pseudo-headers like :authority)
                // 3. Must be a valid HTTP token
                if (
                    !unsafeHeaders.includes(lowerKey) &&
                    !key.startsWith(':') &&
                    tokenRegex.test(key)
                ) {
                    headers[key] = value
                }
            })
        }

        const fetchOptions: any = {
            method: method,
            headers: headers,
            credentials: 'include',
        }

        if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
            fetchOptions.body = body
        }

        try {
            const res = await fetch(url, fetchOptions)
            const endTime = Date.now()
            const duration = endTime - startTime

            const text = await res.text()
            let responseBody = text
            try {
                responseBody = JSON.parse(text)
            } catch (e) {
                // Not JSON
            }

            setResponse({
                status: res.status,
                duration,
                body: responseBody
            })
        } catch (err: any) {
            console.error("Replay Failed:", err)
            setError(err.message || "Request failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in-0">
            <div className="relative w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden max-h-[90vh]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border text-foreground">
                    <h3 className="text-sm font-semibold">Replay Request</h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-auto">
                    <div className="space-y-2">
                        <Label>Method & URL</Label>
                        <div className="flex gap-2">
                            <Select value={method} onValueChange={(val) => setMethod(val as any)}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input value={url} onChange={(e) => setUrl(e.target.value)} className="font-mono text-xs" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Request Body (JSON)</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="font-mono text-xs min-h-[100px]"
                            placeholder="{}"
                        />
                    </div>

                    {/* Response Section */}
                    {(response || error) && (
                        <div className="pt-4 border-t border-border space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Response</Label>
                                {response && (
                                    <div className="flex gap-4">
                                        <StatusBadge status={response.status} />
                                        <span className="text-xs text-muted-foreground font-mono">{response.duration}ms</span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20">
                                    Error: {error}
                                </div>
                            )}

                            {response && (
                                <div className="max-h-[300px] overflow-auto rounded border border-border bg-background p-2">
                                    <JsonViewer data={response.body} searchQuery="" onPreview={() => { }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handleSend} className="gap-2 min-w-[120px]" disabled={loading}>
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Play className="h-3 w-3" /> Send Request
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
