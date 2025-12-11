"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { APICall } from "../types"

interface RequestTabProps {
  call: APICall
}

export function RequestTab({ call }: RequestTabProps) {
  const [copied, setCopied] = useState(false)

  const generateCurl = () => {
    let curl = `curl -X ${call.method} '${call.url}'`

    Object.entries(call.requestHeaders).forEach(([key, value]) => {
      curl += ` \\\n  -H '${key}: ${value}'`
    })

    if (call.requestBody && Object.keys(call.requestBody).length > 0) {
      curl += ` \\\n  -d '${JSON.stringify(call.requestBody)}'`
    }

    return curl
  }

  const copyAsCurl = async () => {
    await navigator.clipboard.writeText(generateCurl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const queryParams = new URL(call.url).searchParams
  const queryParamsArray = Array.from(queryParams.entries())

  return (
    <div className="p-4 space-y-4">
      {/* Headers Table */}
      <div>
        <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Headers</h3>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(call.requestHeaders).map(([key, value], index) => (
                <tr key={key} className={index % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{key}</td>
                  <td className="px-3 py-2 font-mono text-xs break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Query Params Table */}
      {queryParamsArray.length > 0 && (
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Query Parameters</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {queryParamsArray.map(([key, value], index) => (
                  <tr key={key} className={index % 2 === 0 ? "bg-card" : "bg-secondary/20"}>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{key}</td>
                    <td className="px-3 py-2 font-mono text-xs break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Body */}
      {call.requestBody && Object.keys(call.requestBody).length > 0 && (
        <div>
          <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Request Payload</h3>
          <pre className="rounded-lg border border-border bg-background p-4 text-xs font-mono overflow-auto devtools-scrollbar max-h-64">
            {JSON.stringify(call.requestBody, null, 2)}
          </pre>
        </div>
      )}

      {/* Copy as cURL Removed per user request */}
    </div>
  )
}
