// popup.js

// Function to check if a URL is a Chrome internal page
function isChromeInternalPage(url) {
    return url.startsWith('chrome://') || url.startsWith('chrome-extension://');
}

// Function to check if content script is loaded
function isContentScriptLoaded(tabId, callback, retryCount = 0) {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Content script not loaded:', chrome.runtime.lastError.message);
            if (retryCount < 3) {
                setTimeout(() => {
                    isContentScriptLoaded(tabId, callback, retryCount + 1);
                }, 500);
            } else {
                // If content script is not loaded after retries, try injecting it
                injectContentScript(tabId, (injectionSuccess) => {
                    if (injectionSuccess) {
                        // After successful injection, try sending the message again
                        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error('Content script still not responding:', chrome.runtime.lastError.message);
                                callback(false);
                            } else {
                                console.log('Content script loaded successfully after injection');
                                callback(true);
                            }
                        });
                    } else {
                        console.error('Failed to inject content script');
                        callback(false);
                    }
                });
            }
        } else {
            console.log('Content script loaded successfully');
            callback(true);
        }
    });
}

// Function to send message to content script
function sendMessageToContentScript(tabId, callback, retryCount = 0) {
    chrome.tabs.sendMessage(tabId, { action: 'startCapture', tabId: tabId }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError.message);
            if (retryCount < 3) {
                setTimeout(() => {
                    sendMessageToContentScript(tabId, callback, retryCount + 1);
                }, 500);
            } else {
                callback({ error: 'Failed to start capture' });
            }
        } else {
            console.log('Message sent to content script:', response);
            callback(response);
        }
    });
}

// Function to inject content script
function injectContentScript(tabId, callback) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error injecting content script:', chrome.runtime.lastError.message);
            callback(false);
        } else {
            console.log('Content script injected successfully');
            callback(true);
        }
    });
}

// Add event listener to the start button
document.getElementById('startButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
            const tabId = tabs[0].id;
            const tabUrl = tabs[0].url;

            // Check if the current tab is a Chrome internal page
            if (isChromeInternalPage(tabUrl)) {
                console.error('Cannot start visualizer on Chrome internal pages');
                alert('The visualizer cannot be started on Chrome internal pages. Please open a different website.');
                return;
            }

            // Check if content script is loaded
            isContentScriptLoaded(tabId, (isLoaded) => {
                if (isLoaded) {
                    console.log('Sending message to content script');
                    sendMessageToContentScript(tabId, (response) => {
                        if (response && response.error) {
                            console.error('Failed to start capture:', response.error);
                        } else {
                            console.log('Capture started successfully');
                        }
                    });
                } else {
                    console.error('Content script could not be loaded or injected');
                }
            });
        } else {
            console.error('No active tab found');
        }
    });
});