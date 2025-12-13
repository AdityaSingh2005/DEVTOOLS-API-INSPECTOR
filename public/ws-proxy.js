// Content script that injects the hook and relays messages to the extension background

// Inject script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('ws-hook.js');
(document.head || document.documentElement).appendChild(script);
script.onload = function () {
    script.remove();
};

// Listen for messages from the injected script
window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type.startsWith("API_INSIGHT_WS_")) {
        // Relay to background script
        chrome.runtime.sendMessage(event.data);
    }
});
