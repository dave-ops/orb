// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startCapture') {
        chrome.tabs.sendMessage(request.tabId, { action: 'startCapture', tabId: request.tabId })
            .then(() => {
                sendResponse({ success: true, message: 'Capture started' });
            })
            .catch(error => {
                console.error('Error sending message to content script:', error);
                sendResponse({ error: 'Failed to start capture' });
            });

        return true; // Keep the message channel open for async response
    }
});