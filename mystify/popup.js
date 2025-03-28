// popup.js

document.getElementById('startButton').addEventListener('click', () => {
    console.log('Start button clicked');
    chrome.runtime.sendMessage({ action: 'startCapture' });
});