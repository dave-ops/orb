// content.js
// 20230515 14:35 GROK Added logging, removed error handling, hardcoded tabId

console.log('Content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in content script:', request);
    if (request.action === 'startCapture') {
        console.log('Forwarding startCapture message to injected script');
        // Dirty solution: Hardcode tabId in the message
        window.postMessage({ type: "FROM_EXTENSION", action: request.action, tabId: request.tabId || 1 }, "*");
        console.log('Sent message to injected script');
    }
    console.log('Processed message in content script:', request);
});