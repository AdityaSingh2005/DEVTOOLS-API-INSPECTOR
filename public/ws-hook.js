// This script is injected into the page to override window.WebSocket
// It captures all WebSocket traffic and sends it to the content script via window.postMessage

(function () {
    const OriginalWebSocket = window.WebSocket;
    const OriginalSend = OriginalWebSocket.prototype.send;

    window.WebSocket = function (url, protocols) {
        const ws = new OriginalWebSocket(url, protocols);

        const id = crypto.randomUUID();

        // Notify that a new socket is created
        window.postMessage({
            type: "API_INSIGHT_WS_CONNECT",
            payload: {
                id,
                url: url.toString(),
                timestamp: Date.now()
            }
        }, "*");

        // Hook into 'send'
        ws.send = function (data) {
            window.postMessage({
                type: "API_INSIGHT_WS_SEND",
                payload: {
                    id,
                    data: typeof data === 'string' ? data : '[Binary Data]',
                    timestamp: Date.now()
                }
            }, "*");
            return OriginalSend.apply(this, arguments);
        };

        // Hook into 'onmessage'
        // We need to handle both `onmessage` property and `addEventListener`

        ws.addEventListener("message", (event) => {
            window.postMessage({
                type: "API_INSIGHT_WS_MESSAGE",
                payload: {
                    id,
                    data: typeof event.data === 'string' ? event.data : '[Binary Data]',
                    timestamp: Date.now()
                }
            }, "*");
        });

        // Also notify on close/error
        ws.addEventListener("close", () => {
            window.postMessage({
                type: "API_INSIGHT_WS_CLOSE",
                payload: { id, timestamp: Date.now() }
            }, "*");
        });

        return ws;
    };

    // Copy prototype to ensure instance checks pass
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;

})();
