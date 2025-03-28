// popup.js

// Function to send message to content script
function sendMessageToContentScript(tabId, retryCount = 0) {
    const maxRetries = 5;
    const retryDelay = 500; // milliseconds

    chrome.tabs.sendMessage(tabId, { action: 'startCapture', tabId: tabId }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message to content script:', chrome.runtime.lastError.message);
            if (retryCount < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                setTimeout(() => sendMessageToContentScript(tabId, retryCount + 1), retryDelay);
            } else {
                console.error('Max retries reached. Unable to send message to content script.');
            }
        } else {
            if (response && response.error) {
                console.error('Error from content script:', response.error);
            } else {
                console.log('Received response from content script:', response);
            }
        }
    });
}

// Function to check if content script is loaded
function isContentScriptLoaded(tabId, callback) {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

// Function to check if the URL is a Chrome internal page
function isChromeInternalPage(url) {
    return url.startsWith('chrome://');
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
                    sendMessageToContentScript(tabId);
                } else {
                    // Inject the content script if it's not already present
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Error injecting content script:', chrome.runtime.lastError.message);
                            return;
                        }
                        // After successful injection, send the message
                        sendMessageToContentScript(tabId);
                    });
                }
            });
        } else {
            console.error('No active tab found');
        }
    });
});