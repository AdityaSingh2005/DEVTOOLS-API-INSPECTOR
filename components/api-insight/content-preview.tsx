"use client"

import { X, Download, FileSpreadsheet, FileArchive, File as FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export type PreviewType = "html" | "image" | "pdf" | "csv" | "dat" | "xml" | "base64" | null

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
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                            if (content.startsWith("http")) {
                                const link = document.createElement('a')
                                link.href = content
                                link.download = `download.${type === 'image' ? 'png' : type}`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                            } else {
                                // Base64 or Text content
                                let blobContent: BlobPart = content
                                let mime = "text/plain"

                                if (type === "base64") {
                                    try {
                                        const byteCharacters = atob(content)
                                        const byteNumbers = new Array(byteCharacters.length)
                                        for (let i = 0; i < byteCharacters.length; i++) {
                                            byteNumbers[i] = byteCharacters.charCodeAt(i)
                                        }
                                        blobContent = new Uint8Array(byteNumbers)
                                        mime = "application/octet-stream"
                                    } catch (e) {
                                        console.error("Download fail")
                                        return
                                    }
                                } else if (type === "html") mime = "text/html"
                                else if (type === "xml") mime = "text/xml"
                                else if (type === "csv") mime = "text/csv"

                                const blob = new Blob([blobContent], { type: mime })
                                const url = URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = `download.${type === 'base64' ? 'bin' : type}`
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                URL.revokeObjectURL(url)
                            }
                        }}>
                            <Download className="h-4 w-4" /> Download
                        </Button>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-white/5 dark:bg-black/20 p-4 flex flex-col">
                    {(type === "html" || type === "csv" || type === "dat" || type === "xml") && (
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
                    {type === "base64" && (
                        <div className="flex flex-col h-full gap-4">
                            <div className="bg-muted p-4 rounded-md overflow-auto max-h-[50%] animate-in fade-in-50">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-semibold text-muted-foreground">Decoded Content</h4>
                                    {(() => {
                                        let decoded = ""
                                        try { decoded = atob(content) } catch (e) { return null }

                                        // Simple Magic Bytes Detection
                                        let fileLabel = "Binary File"
                                        let icon = <FileIcon className="h-3 w-3" />
                                        let ext = "bin"
                                        let mime = "application/octet-stream"

                                        if (decoded.startsWith("PK")) {
                                            fileLabel = "Zip / Office Document"
                                            icon = <FileArchive className="h-3 w-3" />
                                            ext = "zip" // Could be xlsx, docx, etc. but zip is safe generic
                                            mime = "application/zip"
                                        } else if (decoded.startsWith("%PDF")) {
                                            fileLabel = "PDF Document"
                                            ext = "pdf"
                                            mime = "application/pdf"
                                        }

                                        const handleDownload = () => {
                                            try {
                                                const byteCharacters = atob(content);
                                                const byteNumbers = new Array(byteCharacters.length);
                                                for (let i = 0; i < byteCharacters.length; i++) {
                                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                }
                                                const byteArray = new Uint8Array(byteNumbers);
                                                const blob = new Blob([byteArray], { type: mime });

                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `downloaded_content.${ext}`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                URL.revokeObjectURL(url);
                                            } catch (e) {
                                                console.error("Download failed", e)
                                            }
                                        }

                                        return (
                                            <Button variant="outline" size="sm" className="h-6 gap-2 text-xs" onClick={handleDownload}>
                                                {icon} Download as .{ext} <Download className="h-3 w-3" />
                                            </Button>
                                        )
                                    })()}
                                </div>
                                <pre className="text-xs break-all whitespace-pre-wrap font-mono select-text">
                                    {(() => {
                                        try {
                                            return atob(content)
                                        } catch (e) {
                                            return "Error decoding Base64"
                                        }
                                    })()}
                                </pre>
                            </div>
                            <div className="bg-muted p-4 rounded-md overflow-auto flex-1">
                                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Raw Base64</h4>
                                <pre className="text-xs break-all whitespace-pre-wrap font-mono text-muted-foreground select-text">
                                    {content}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
