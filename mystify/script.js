// script.js
// 20230516 10:10 GROK Added more logging, removed error handling, kept hardcoded tabId

// Create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to capture audio from a specific tab
function captureTabAudio(tabId) {
    console.log('Attempting to capture audio from tab:', tabId);
    chrome.tabCapture.capture({
        audio: true,
        video: false,
        targetTabId: tabId
    }, stream => {
        console.log('Stream captured:', stream);
        if (!stream) {
            console.log('Failed to capture tab audio');
            return;
        }

        const source = audioContext.createMediaStreamSource(stream);

        // Create an Analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // Get the visualizer element
        let visualizer = document.getElementById('visualizer');
        let bar = document.getElementById('bar');

        // If visualizer doesn't exist, create it
        if (!visualizer) {
            visualizer = document.createElement('div');
            visualizer.id = 'visualizer';
            visualizer.style.width = '50px';
            visualizer.style.height = '300px';
            visualizer.style.backgroundColor = '#ddd';
            visualizer.style.borderRadius = '10px';
            visualizer.style.overflow = 'hidden';
            visualizer.style.position = 'relative';

            bar = document.createElement('div');
            bar.id = 'bar';
            bar.style.width = '100%';
            bar.style.height = '0';
            bar.style.backgroundColor = '#4CAF50';
            bar.style.position = 'absolute';
            bar.style.bottom = '0';
            bar.style.transition = 'height 0.1s ease-out';

            visualizer.appendChild(bar);
            document.body.appendChild(visualizer);
        }

        // Function to update the visualizer
        function updateVisualizer() {
            // Create a new array to receive the data
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            // Get the current frequency data
            analyser.getByteFrequencyData(dataArray);

            // Calculate the average volume
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

            // Map the average volume to a height between 0 and 100%
            const height = (average / 255) * 100;

            // Update the bar height
            bar.style.height = height + '%';

            // Request the next animation frame
            requestAnimationFrame(updateVisualizer);
        }

        // Start the animation
        updateVisualizer();

        // Resume the audio context if it's suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    });
}

// Listen for messages from the content script
window.addEventListener("message", (event) => {
    console.log('Received message in injected script:', event.data);
    if (event.source === window && event.data.type && event.data.type === "FROM_EXTENSION") {
        if (event.data.action === 'startCapture') {
            // Dirty solution: Use a hardcoded tabId if not provided
            const tabId = event.data.tabId || 1; // Assuming tabId 1 as a fallback
            captureTabAudio(tabId);
        }
    }
});