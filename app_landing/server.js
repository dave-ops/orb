const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files
app.use(express.static(path.join(__dirname)));

async function testFileRead() {
    try {
        const html = await fs.readFile(path.join(__dirname, 'xindex.html'), 'utf8');
        console.log('Successfully read xindex.html');
        const json = await fs.readFile(path.join(__dirname, 'index.json'), 'utf8');
        console.log('Successfully read index.json');
    } catch (err) {
        console.error('Error reading files:', err);
    }
}

testFileRead();

// Function to replace tokens in HTML with values from JSON
function replaceTokens(html, jsonData) {
    console.log(html);
    console.log('Starting token replacement');
    for (const [key, value] of Object.entries(jsonData)) {
        const token = `${key}`;
        //console.log(`Replacing ${token} with ${value}`);

        // Use a simple string replacement instead of regex
        while (html.includes(token)) {
            html = html.replace(token, value);
        }
    }
    console.log('Token replacement completed');
    return html;
}

// Route to serve the modified HTML
app.get('/', async (req, res) => {
    console.log("Request received for '/'");
    try {
        // Read the HTML file
        console.log('Reading xindex.html');
        let html = await fs.readFile(path.join(__dirname, 'xindex.html'), 'utf8');
        console.log('HTML file read successfully');

        // Read the JSON file
        console.log('Reading index.json');
        const jsonString = await fs.readFile(path.join(__dirname, 'index.json'), 'utf8');
        console.log('JSON file read successfully');

        console.log('Parsing JSON data');
        const jsonData = JSON.parse(jsonString);
        console.log('JSON data parsed successfully');

        console.log('Replacing tokens in HTML');
        html = replaceTokens(html, jsonData);
        console.log('Tokens replaced successfully');

        res.send(html);
        console.log('Response sent successfully');
    } catch (err) {
        console.error('Error processing files:', err);
        res.status(500).send('Error processing files');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});