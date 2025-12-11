import { useState, useEffect, useCallback } from "react"
import { APICall, Session } from "@/components/api-insight/types"
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
            // Put mock data in the first session
            setSessions([{
                id: 'mock-session',
                timestamp: Date.now(),
                logs: mockAPIData,
                isOpen: true
            }])
            return
        }

        const handleRequestFinished = (entry: chrome.devtools.network.Request) => {
            // Filter out data URLs
            if (!isCapturing || entry.request.url.startsWith("data:")) return

            const newCall = mapHarEntryToAPICall(entry as any, crypto.randomUUID())

            // Get content if available (async)
            entry.getContent((content, encoding) => {
                if (content) {
                    try {
                        newCall.responseBody = JSON.parse(content)
                    } catch (e) {
                        newCall.responseBody = content
                    }
                }

                setSessions((prev) => {
                    const activeSessionIndex = 0 // The newest session is always at 0
                    const newSessions = [...prev]

                    if (!newSessions[activeSessionIndex]) {
                        // Should not happen, but safe guard
                        newSessions[0] = { id: crypto.randomUUID(), timestamp: Date.now(), logs: [], isOpen: true }
                    }

                    const updatedSession = {
                        ...newSessions[activeSessionIndex],
                        logs: [newCall, ...newSessions[activeSessionIndex].logs]
                    }

                    newSessions[activeSessionIndex] = updatedSession
                    return newSessions
                })
            })
        }

        const handleNavigated = () => {
            // Page refreshed or navigated. Start a new session.
            setSessions(prev => {
                // limit total sessions? Maybe top 10?
                const newSession: Session = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    logs: [],
                    isOpen: true
                }

                // Mark previous sessions as closed? User requirement: "only the current one will be always open"
                // But also "you can also give a chevron icon... on clicking which it will work as a dropdown... by default it will be close"
                // So old sessions should be closed by default when a new one starts.

                const closedOldSessions = prev.map(s => ({ ...s, isOpen: false }))

                return [newSession, ...closedOldSessions]
            })
        }

        chrome.devtools.network.onRequestFinished.addListener(handleRequestFinished)
        chrome.devtools.network.onNavigated.addListener(handleNavigated)

        // Also get existing requests (this handles "start tracking from page load" if devtools was open)
        chrome.devtools.network.getHAR((harLog) => {
            if (harLog && harLog.entries) {
                const initialCalls = harLog.entries
                    .filter(entry => !entry.request.url.startsWith("data:"))
                    .map(entry => mapHarEntryToAPICall(entry as any, crypto.randomUUID()));

                setSessions(prev => {
                    const newSessions = [...prev]
                    // We add these to the current session (index 0)
                    // Note: getHAR returns ALL requests from page start.
                    // If we already have a session, we might be navigating.
                    // But getHAR is called ONCE on mount.

                    if (initialCalls.length > 0) {
                        const updatedSession = {
                            ...newSessions[0],
                            logs: [...initialCalls, ...newSessions[0].logs]
                        }
                        newSessions[0] = updatedSession
                    }
                    return newSessions
                })
            }
        })

        return () => {
            chrome.devtools.network.onRequestFinished.removeListener(handleRequestFinished)
            chrome.devtools.network.onNavigated.removeListener(handleNavigated)
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
