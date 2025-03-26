// Get the canvas element
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Audio context
let audioContext;
let analyser;
let source;

// Initialize audio context and analyser
async function initAudio() {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    // Request access to the system's audio output
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
    } catch (err) {
        console.error('Error accessing audio:', err);
    }
}

// Draw function
function draw() {
    requestAnimationFrame(draw);

    // Get frequency data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up wave properties
    const barWidth = canvas.width / bufferLength;
    let x = 0;

    // Draw waves
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 2;

        // Create a smooth wave effect
        ctx.beginPath();
        ctx.moveTo(x, canvas.height / 2);
        ctx.bezierCurveTo(
            x + barWidth / 3, canvas.height / 2 - barHeight / 2,
            x + 2 * barWidth / 3, canvas.height / 2 + barHeight / 2,
            x + barWidth, canvas.height / 2
        );
        ctx.strokeStyle = `hsl(${dataArray[i] * 2}, 100%, 50%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        x += barWidth;
    }
}

// Initialize the visualizer
async function init() {
    await initAudio();
    draw();
}

// Start the visualizer when the page loads
window.onload = init;