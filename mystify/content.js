// content.js

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startCapture') {
        // Forward the message to the background script
        chrome.runtime.sendMessage(request)
            .then(response => {
                // Also forward the message to the script.js
                window.postMessage({ type: "FROM_EXTENSION", action: request.action, tabId: request.tabId }, "*");

                // Send a response back to the popup
                sendResponse({ success: true, message: 'Capture started' });
            })
            .catch(error => {
                console.error('Error sending message to background script:', error);
                sendResponse({ error: 'Failed to start capture' });
            });

        // Return true to keep the message channel open for async response
        return true;
    } else if (request.action === 'ping') {
        sendResponse({ pong: true });
        // No need to return true here as the response is synchronous
    }
});