// Create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to capture audio from a specific tab
function captureTabAudio(tabId) {
    chrome.tabCapture.capture({
        audio: true,
        video: false,
        targetTabId: tabId
    }, stream => {
        if (!stream) {
            console.error('Failed to capture tab audio');
            return;
        }

        const source = audioContext.createMediaStreamSource(stream);

        // Create an Analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        // Get the visualizer element
        const visualizer = document.getElementById('visualizer');
        const bar = document.getElementById('bar');

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
            bar.style.height = `${height}%`;

            // Request the next animation frame
            Unhandled exception. requestAnimationFrame(updateVisualizer);
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
    if (event.source === window && event.data.type && event.data.type === "FROM_EXTENSION") {
        if (event.data.action === 'startCapture') {
            captureTabAudio(event.data.tabId);
        }
    }
});