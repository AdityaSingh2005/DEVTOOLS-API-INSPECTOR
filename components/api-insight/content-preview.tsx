"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type PreviewType = "html" | "image" | "pdf" | "csv" | "dat" | null

interface ContentPreviewProps {
    type: PreviewType
    content: string
    onClose: () => void
}

export function ContentPreview({ type, content, onClose }: ContentPreviewProps) {
    if (!type) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in-0">
            <div className="relative w-full max-w-6xl h-[90vh] bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <h3 className="text-sm font-semibold capitalize">{type} Preview</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-hidden bg-white/5 dark:bg-black/20 p-4 flex flex-col">
                    {(type === "html" || type === "csv" || type === "dat") && (
                        <div className="bg-white rounded-md flex-1 overflow-hidden border border-border">
                            {content.startsWith("http") || content.startsWith("/") ? (
                                <iframe
                                    src={content}
                                    className="w-full h-full"
                                    title={`${type.toUpperCase()} Preview`}
                                />
                            ) : (
                                <iframe
                                    srcDoc={`
                                    <html>
                                        <head>
                                            <style>
                                                body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 1rem; color: #0f172a; white-space: pre-wrap; font-family: monospace; }
                                                table { border-collapse: collapse; width: 100%; border: 1px solid #e2e8f0; }
                                                th, td { border: 1px solid #e2e8f0; padding: 0.5rem; text-align: left; }
                                                th { background-color: #f8fafc; font-weight: 600; }
                                                img { max-width: 100%; height: auto; }
                                            </style>
                                        </head>
                                        <body>${content}</body>
                                    </html>
                                `}
                                    className="w-full h-full"
                                    title={`${type.toUpperCase()} Preview`}
                                />
                            )}
                        </div>
                    )}
                    {type === "image" && (
                        <div className="flex items-center justify-center h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={content} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                    )}
                    {type === "pdf" && (
                        <iframe
                            src={content}
                            className="w-full h-full border-0"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
