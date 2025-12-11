"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PreviewType } from "./content-preview"

interface JsonViewerProps {
    data: unknown
    searchQuery: string
    onPreview: (type: PreviewType, content: string) => void
}

export function JsonViewer({ data, searchQuery, onPreview }: JsonViewerProps) {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(["root"]))

    const toggleKey = (key: string) => {
        const newExpanded = new Set(expandedKeys)
        if (newExpanded.has(key)) {
            newExpanded.delete(key)
        } else {
            newExpanded.add(key)
        }
        setExpandedKeys(newExpanded)
    }

    const highlightText = (text: string) => {
        if (!searchQuery) return text
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
        const parts = text.split(regex)
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="bg-yellow-400/40 text-foreground rounded px-0.5">
                    {part}
                </mark>
            ) : (
                part
            )
        )
    }

    const detectContent = (value: string): PreviewType => {
        const lowerValue = value.toLowerCase()

        // Check for Data URIs
        if (lowerValue.startsWith("data:image/")) return "image"
        if (lowerValue.startsWith("data:application/pdf")) return "pdf"

        // Check for URLs (http, https, or relative)
        if (lowerValue.startsWith("http") || lowerValue.startsWith("/")) {
            // Check for extensions (relax regex to allow query params)
            // valid extensions: .png, .jpg, .jpeg, .gif, .webp, .svg, .pdf
            // Regex: \.(ext)([?#].*)?$
            if (/\.(jpeg|jpg|gif|png|webp|svg)($|[?#])/i.test(value)) return "image"
            if (/\.pdf($|[?#])/i.test(value)) return "pdf"

            if (lowerValue.includes("blob:")) return "image" // Fallback for blob URLs if we can't be sure
        }

        // Check for standalone Blob URLs (often uuid)
        if (lowerValue.startsWith("blob:")) {
            // If it explicitly says pdf/image in some way? 
            // Or if we just trust it's a media blob?
            // User example: "figure_without_caption: ...blob.../graph.png" -> This has extension.
            // User example: "url: ...blob.../report.pdf" -> This has extension.
            // So strict extension check on blob URLs is also good.
            if (/\.(jpeg|jpg|gif|png|webp|svg)($|[?#])/i.test(value)) return "image"
            if (/\.pdf($|[?#])/i.test(value)) return "pdf"

            // If no extension, but standard blob? 
            // Let's assume image for generic blobs for now? Or maybe return null to be safe.
            return null
        }

        // Check for HTML
        // User example: "<table>...</table>" inside a string
        // Heuristic: Starts with <tag> and ends with </tag> or contains known HTML tags.
        const trimmed = value.trim()
        if ((trimmed.startsWith("<") && trimmed.endsWith(">")) || trimmed.includes("</table>") || trimmed.includes("</div>") || trimmed.includes("<br>")) {
            return "html"
        }

        return null
    }

    const renderValue = (value: unknown, path: string): React.ReactNode => {
        if (value === null) return <span className="text-muted-foreground">null</span>
        if (typeof value === "boolean") return <span className="text-blue-400">{value.toString()}</span>
        if (typeof value === "number") return <span className="text-green-400">{value}</span>

        if (typeof value === "string") {
            const detectedType = detectContent(value)

            // User requested "Eye icon after the key name". 
            // Since function renders value, we place it at start of value, which is effectively after key+colon.

            return (
                <span className="group inline-flex items-center gap-2">
                    {detectedType && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-primary hover:bg-primary/10 -ml-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                onPreview(detectedType, value)
                            }}
                            title={`Preview ${detectedType}`}
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                    )}
                    <span className="text-yellow-400">"{highlightText(value)}"</span>
                </span>
            )
        }

        if (Array.isArray(value)) {
            const isExpanded = expandedKeys.has(path)
            return (
                <span>
                    <button onClick={() => toggleKey(path)} className="inline-flex items-center hover:text-primary">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                    <span className="text-muted-foreground">Array({value.length})</span>
                    {isExpanded && (
                        <div className="ml-4 border-l border-border pl-2">
                            {value.map((item, index) => (
                                <div key={index}>
                                    <span className="text-muted-foreground">{index}: </span>
                                    {renderValue(item, `${path}.${index}`)}
                                </div>
                            ))}
                        </div>
                    )}
                </span>
            )
        }

        if (typeof value === "object") {
            const isExpanded = expandedKeys.has(path)
            const entries = Object.entries(value as Record<string, unknown>)
            return (
                <span>
                    <button onClick={() => toggleKey(path)} className="inline-flex items-center hover:text-primary">
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                    <span className="text-muted-foreground">
                        {"{"}
                        {entries.length}
                        {"}"}
                    </span>
                    {isExpanded && (
                        <div className="ml-4 border-l border-border pl-2">
                            {entries.map(([key, val]) => (
                                <div key={key}>
                                    <span className="text-purple-400">{highlightText(key)}</span>
                                    <span className="text-muted-foreground">: </span>
                                    {renderValue(val, `${path}.${key}`)}
                                </div>
                            ))}
                        </div>
                    )}
                </span>
            )
        }

        return String(value)
    }

    return (
        <div className="rounded-lg border border-border bg-background p-4 font-mono text-xs overflow-auto devtools-scrollbar max-h-96">
            {renderValue(data, "root")}
        </div>
    )
}
