import { useState, useEffect, useCallback } from "react"
import { APICall, Session, WSFrame } from "@/components/api-insight/types"
import { mockAPIData } from "@/components/api-insight/mock-data"
import { mapHarEntryToAPICall } from "@/lib/har-mapper"

export function useNetworkMonitor() {
    const [sessions, setSessions] = useState<Session[]>([{
        id: 'initial',
        timestamp: Date.now(),
        logs: [],
        isOpen: true
    }])
    const [isCapturing, setIsCapturing] = useState(true)

    const clearLogs = useCallback(() => {
        setSessions([{
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            logs: [],
            isOpen: true
        }])
    }, [])

    const toggleSession = useCallback((sessionId: string) => {
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, isOpen: !s.isOpen } : s
        ))
    }, [])

    useEffect(() => {
        // Check if running in Chrome DevTools
        const isDevTools = typeof chrome !== "undefined" && !!chrome.devtools && !!chrome.devtools.network

        if (!isDevTools) {
            // Fallback to mock data for local development
            setSessions([{
                id: 'mock-session',
                timestamp: Date.now(),
                logs: mockAPIData, // we might want to add mock WS data here later
                isOpen: true
            }])
            return
        }

        // --- HTTP Handling ---
        const handleRequestFinished = (entry: chrome.devtools.network.Request) => {
            if (!isCapturing || entry.request.url.startsWith("data:")) return

            // Get content if available (async)
            entry.getContent((content, encoding) => {
                let parsedBody = null
                if (content) {
                    try {
                        parsedBody = JSON.parse(content)
                    } catch (e) {
                        parsedBody = content
                    }
                }

                setSessions((prev) => {
                    const activeSessionIndex = 0
                    const newSessions = [...prev]
                    if (!newSessions[0]) newSessions[0] = { id: crypto.randomUUID(), timestamp: Date.now(), logs: [], isOpen: true }

                    const session = newSessions[0];
                    const entryTime = new Date(entry.startedDateTime).getTime();

                    // Try to find a pending/matching request
                    const existingIndex = session.logs.findIndex(call => {
                        // Match by URL and time proximity (within 2000ms)
                        // And status is pending (0) or completed (we update it with full details)
                        const timeDiff = Math.abs(call.timestamp - entryTime);
                        return call.url === entry.request.url && timeDiff < 2000;
                    });

                    const fullCall = mapHarEntryToAPICall(entry as any, existingIndex !== -1 ? session.logs[existingIndex].id : crypto.randomUUID())
                    fullCall.responseBody = parsedBody;

                    if (existingIndex !== -1) {
                        // Update existing (merge)
                        // We preserve the ID to avoid UI jumps
                        session.logs[existingIndex] = {
                            ...session.logs[existingIndex], // Keep existing data (like ID)
                            ...fullCall, // Overwrite with HAR data
                            id: session.logs[existingIndex].id
                        };
                        // Move to top? Or keep position?
                        // Usually keep position or move to top if updated? 
                        // If it was pending, it's already in the list. Updating in place is better.
                        newSessions[0] = { ...session, logs: [...session.logs] };
                    } else {
                        // Add new
                        newSessions[0] = {
                            ...session,
                            logs: [fullCall, ...session.logs]
                        }
                    }

                    return newSessions
                })
            })
        }

        // --- WebSocket Handling ---
        let bgPort: chrome.runtime.Port | null = null;
        try {
            bgPort = chrome.runtime.connect({ name: "api-insight-devtools" });
            bgPort.postMessage({
                name: "init",
                tabId: chrome.devtools.inspectedWindow.tabId
            });

            bgPort.onMessage.addListener((msg: any) => {
                if (!isCapturing) return;

                if (msg.type === "API_INSIGHT_WS_CONNECT") {
                    const { id, url, timestamp } = msg.payload;
                    const newCall: APICall = {
                        id,
                        url,
                        method: "WS",
                        status: 101,
                        duration: 0,
                        timestamp,
                        requestHeaders: {},
                        responseHeaders: {},
                        requestBody: {},
                        responseBody: [] as WSFrame[],
                        requestSize: 0,
                        responseSize: 0,
                        contentType: "websocket",
                        responseType: "ws",
                        previewData: {}
                    };

                    setSessions(prev => {
                        const newSessions = [...prev];
                        if (!newSessions[0]) newSessions[0] = { id: crypto.randomUUID(), timestamp: Date.now(), logs: [], isOpen: true }

                        // Add to top
                        newSessions[0] = {
                            ...newSessions[0],
                            logs: [newCall, ...newSessions[0].logs]
                        }
                        return newSessions;
                    });
                } else if (msg.type === "API_INSIGHT_REQUEST_STARTED") {
                    const { requestId, url, method, timestamp } = msg.payload;
                    const newCall: APICall = {
                        id: requestId, // Use webRequest ID temporarily
                        url,
                        method,
                        status: 0, // 0 = Pending
                        duration: 0,
                        timestamp,
                        requestHeaders: {},
                        responseHeaders: {},
                        requestBody: {},
                        responseBody: null,
                        requestSize: 0,
                        responseSize: 0,
                        contentType: "",
                    };

                    setSessions(prev => {
                        const newSessions = [...prev];
                        if (!newSessions[0]) newSessions[0] = { id: crypto.randomUUID(), timestamp: Date.now(), logs: [], isOpen: true }
                        // Add to top
                        newSessions[0] = { ...newSessions[0], logs: [newCall, ...newSessions[0].logs] }
                        return newSessions;
                    });

                } else if (msg.type === "API_INSIGHT_REQUEST_COMPLETED") {
                    const { requestId, statusCode, timestamp } = msg.payload;
                    setSessions(prev => {
                        const newSessions = [...prev];
                        if (!newSessions[0]) return prev;
                        const logs = newSessions[0].logs.map(call => {
                            if (call.id === requestId) {
                                return { ...call, status: statusCode, duration: timestamp - call.timestamp }
                            }
                            return call;
                        });
                        newSessions[0] = { ...newSessions[0], logs };
                        return newSessions;
                    });
                } else if (msg.type === "API_INSIGHT_REQUEST_ERROR") {
                    const { requestId, error, timestamp } = msg.payload;
                    setSessions(prev => {
                        const newSessions = [...prev];
                        if (!newSessions[0]) return prev;
                        const logs = newSessions[0].logs.map(call => {
                            if (call.id === requestId) {
                                return { ...call, status: 500, responseBody: { error }, duration: timestamp - call.timestamp }
                            }
                            return call;
                        });
                        newSessions[0] = { ...newSessions[0], logs };
                        return newSessions;
                    });

                } else if (msg.type === "API_INSIGHT_WS_SEND" || msg.type === "API_INSIGHT_WS_MESSAGE") {
                    const { id, data, timestamp } = msg.payload;
                    const frame: WSFrame = {
                        id: crypto.randomUUID(),
                        data,
                        type: msg.type === "API_INSIGHT_WS_SEND" ? "send" : "receive",
                        timestamp
                    };

                    setSessions(prev => {
                        const newSessions = [...prev];
                        const activeSession = newSessions[0];
                        if (!activeSession) return prev;

                        const logs = activeSession.logs.map(call => {
                            if (call.id === id && call.method === "WS") {
                                const currentFrames = (call.responseBody as WSFrame[]) || [];
                                return {
                                    ...call,
                                    responseBody: [...currentFrames, frame],
                                    responseSize: (call.responseSize || 0) + (data ? data.length : 0)
                                };
                            }
                            return call;
                        });

                        newSessions[0] = { ...activeSession, logs };
                        return newSessions;
                    });
                } else if (msg.type === "API_INSIGHT_WS_CLOSE") {
                    // Update duration?
                    const { id, timestamp } = msg.payload;
                    setSessions(prev => {
                        const newSessions = [...prev];
                        const activeSession = newSessions[0];
                        if (!activeSession) return prev;

                        const logs = activeSession.logs.map(call => {
                            if (call.id === id && call.method === "WS") {
                                return {
                                    ...call,
                                    duration: timestamp - call.timestamp,
                                    status: 200 // Closed
                                };
                            }
                            return call;
                        });

                        newSessions[0] = { ...activeSession, logs };
                        return newSessions;
                    });
                }
            });

        } catch (e) {
            console.error("Failed to connect to background script", e);
        }

        const handleNavigated = () => {
            setSessions(prev => {
                const newSession: Session = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    logs: [],
                    isOpen: true
                }
                const closedOldSessions = prev.map(s => ({ ...s, isOpen: false }))
                return [newSession, ...closedOldSessions]
            })
        }

        chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished)
        chrome.devtools.network.onNavigated.addListener(handleNavigated)

        chrome.devtools.network.getHAR((harLog) => {
            if (harLog && harLog.entries) {
                const initialCalls = harLog.entries
                    .filter(entry => !entry.request.url.startsWith("data:"))
                    .map(entry => mapHarEntryToAPICall(entry as any, crypto.randomUUID()));

                setSessions(prev => {
                    const newSessions = [...prev]
                    if (initialCalls.length > 0) {
                        newSessions[0] = {
                            ...newSessions[0],
                            logs: [...initialCalls, ...newSessions[0].logs]
                        }
                    }
                    return newSessions
                })
            }
        })

        return () => {
            chrome.devtools.network.onRequestFinished.removeListener(handleRequestFinished)
            chrome.devtools.network.onNavigated.removeListener(handleNavigated)
            if (bgPort) bgPort.disconnect();
        }
    }, [isCapturing])

    return {
        sessions,
        isCapturing,
        setIsCapturing,
        clearLogs,
        toggleSession
    }
}
