// Background service worker
console.log("DevTools API Inspector background worker started.");

const connections = {};

chrome.runtime.onConnect.addListener(function (port) {
    const extensionListener = function (message, sender, sendResponse) {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init" && message.tabId) {
            connections[message.tabId] = port;
            console.log("Connected to devtools for tab " + message.tabId);
            return;
        }
    }

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function (port) {
        port.onMessage.removeListener(extensionListener);

        const tabs = Object.keys(connections);
        for (const i of tabs) {
            if (connections[i] == port) {
                delete connections[i];
                break;
            }
        }
    });
});

// Receive message from content script and relay to the devtools page for the current tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Check if it's a WS message
    if (request.type && request.type.startsWith("API_INSIGHT_WS_")) {
        if (sender.tab) {
            const tabId = sender.tab.id;
            if (tabId in connections) {
                connections[tabId].postMessage(request);
            } else {
                // If devtools is not open for this tab, we ignore or could buffer
            }
        }
    }
    return true;
});

// Capture Pending Requests
// Note: This requires "webRequest" permission which we have.
// We need to filter by tabId, but webRequest is global? No, we can get tabId from details.

const filter = { urls: ["<all_urls>"] };

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        const tabId = details.tabId;
        if (tabId in connections) {
            connections[tabId].postMessage({
                type: "API_INSIGHT_REQUEST_STARTED",
                payload: {
                    requestId: details.requestId,
                    url: details.url,
                    method: details.method,
                    timestamp: Date.now()
                }
            });
        }
    },
    filter
);

chrome.webRequest.onCompleted.addListener(
    (details) => {
        const tabId = details.tabId;
        if (tabId in connections) {
            connections[tabId].postMessage({
                type: "API_INSIGHT_REQUEST_COMPLETED",
                payload: {
                    requestId: details.requestId,
                    statusCode: details.statusCode,
                    timestamp: Date.now()
                }
            });
        }
    },
    filter
);

chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
        const tabId = details.tabId;
        if (tabId in connections) {
            connections[tabId].postMessage({
                type: "API_INSIGHT_REQUEST_ERROR",
                payload: {
                    requestId: details.requestId,
                    error: details.error,
                    timestamp: Date.now()
                }
            });
        }
    },
    filter
);
