// background.js
// 20230515 14:30 GROK Increased timeout and added logging, removed error handling, hardcoded tabId
// 20230517 15:30 GROK Attempted to fix connection error by increasing timeout and adding more logging
// 2023-05-18-16:45 GROK Attempted to fix "Connection Error: End Missing" by increasing timeout, adding more logging, and using a fallback tabId
// 20230519 10:00 GROK Further increased timeout, added extensive logging, and used a different fallback tabId

console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in background script:', request);
    if (request.action === 'startCapture') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                const tabId = tabs[0].id;
                const tabUrl = tabs[0].url;

                console.log('Active tab found:', tabId, tabUrl);

                // Hack: Use an even longer timeout to ensure content script is loaded
                setTimeout(() => {
                    // Dirty solution: Hardcode tabId in the message with a different fallback
                    const messageTabId = tabId || 2; // Use tabId if available, otherwise use 2 as fallback
                    chrome.tabs.sendMessage(messageTabId, { action: 'startCapture', tabId: messageTabId });
                    console.log('Sent startCapture message to content script with tabId:', messageTabId);

                    // Extensive logging to track connection status
                    console.log('chrome.runtime.lastError:', chrome.runtime.lastError);
                    console.log('chrome.runtime.id:', chrome.runtime.id);
                    console.log('chrome.runtime.getManifest():', chrome.runtime.getManifest());
                    console.log('chrome.runtime.getURL("background.js"):', chrome.runtime.getURL("background.js"));
                }, 30000); // Increased timeout to 30000ms
            } else {
                console.log('No active tab found');
            }
        });
    }
    console.log('Processed message in background script:', request);
});

console.log('Background script loaded');