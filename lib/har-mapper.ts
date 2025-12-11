import { APICall } from "@/components/api-insight/types"

export function mapHarEntryToAPICall(entry: chrome.devtools.network.Request, id: string): APICall {
    try {
        const requestBodySize = entry.request.bodySize !== -1 ? entry.request.bodySize : 0
        const responseBodySize = entry.response.bodySize !== -1 ? entry.response.bodySize : 0

        const requestHeaders = (entry.request.headers || []).reduce((acc: Record<string, string>, header) => {
            acc[header.name] = header.value || ""
            return acc
        }, {} as Record<string, string>)

        const responseHeaders = (entry.response.headers || []).reduce((acc: Record<string, string>, header) => {
            acc[header.name] = header.value || ""
            return acc
        }, {} as Record<string, string>)

        let requestBody: Record<string, unknown> = {}
        try {
            if (entry.request.postData?.text) {
                requestBody = JSON.parse(entry.request.postData.text)
            }
        } catch (e) {
            if (entry.request.postData?.text) {
                requestBody = { text: entry.request.postData.text }
            }
        }

        // We can't get the response body directly in onRequestFinished without calling getContent()
        // which is async. For this mapper, we'll initialize it as null/unknown and let the caller handle fetching if needed.
        // Or simpler: strictly typed as unknown.

        const mimeType = entry.response.content?.mimeType || "unknown"

        return {
            id,
            url: entry.request.url || "unknown",
            method: (entry.request.method || "GET") as APICall["method"],
            status: entry.response.status || 0,
            duration: entry.time || 0,
            timestamp: entry.startedDateTime ? new Date(entry.startedDateTime).getTime() : Date.now(),
            requestHeaders,
            responseHeaders,
            requestBody,
            responseBody: null,
            requestSize: requestBodySize,
            responseSize: responseBodySize,
            contentType: mimeType,
            initiator: (entry._initiator && typeof entry._initiator !== 'string' ? entry._initiator.type : "unknown"),
            responseType: mimeType.includes("json") ? "json" :
                mimeType.includes("image") ? "image" :
                    mimeType.includes("html") ? "html" : "binary"
        }
    } catch (error) {
        console.error("Failed to map HAR entry", error, entry);
        // Return a dummy error call so we can at least see something happened
        return {
            id,
            url: "error-mapping-entry",
            method: "GET",
            status: 0,
            duration: 0,
            timestamp: Date.now(),
            requestHeaders: {},
            responseHeaders: {},
            requestBody: { error: String(error) },
            responseBody: null,
            requestSize: 0,
            responseSize: 0,
            contentType: "error",
            initiator: "error"
        }
    }
}
