// background.js
// 20230515 14:30 GROK Increased timeout and added logging, removed error handling, hardcoded tabId

console.log('Background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message in background script:', request);
    if (request.action === 'startCapture') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                const tabId = tabs[0].id;
                const tabUrl = tabs[0].url;

                console.log('Active tab found:', tabId, tabUrl);

                // Hack: Use a much longer timeout to ensure content script is loaded
                setTimeout(() => {
                    // Dirty solution: Hardcode tabId in the message
                    chrome.tabs.sendMessage(tabId, { action: 'startCapture', tabId: tabId });
                    console.log('Sent startCapture message to content script');
                }, 5000); // Increased from 2000 to 5000
            } else {
                console.log('No active tab found');
            }
        });
    }
    console.log('Processed message in background script:', request);
});