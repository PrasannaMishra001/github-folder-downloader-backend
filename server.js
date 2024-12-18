const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['https://prasannamishra001.github.io', 'http://localhost:3000']
}));

app.use(express.json());

app.post('/download', async (req, res) => {
  const { repoUrl, folderName } = req.body;

  try {
    // Extract repo owner and name from the URL
    const match = repoUrl.match(/https:\/\/github.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid GitHub URL' });
    }

    const repoOwner = match[1];
    const repoName = match[2];
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderName}`;

    // Fetch folder contents from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const files = response.data;

    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'No files found in this folder' });
    }

    // Save files to a folder on the server
    const downloadFolder = path.join(__dirname, 'downloads', folderName);
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    // Download all files
    const downloadPromises = files.map(async (file) => {
      if (file.type === 'file') {
        const fileResponse = await axios.get(file.download_url, { responseType: 'arraybuffer' });
        fs.writeFileSync(path.join(downloadFolder, file.name), fileResponse.data);
      }
    });

    await Promise.all(downloadPromises);

    res.json({ success: true, message: 'Files downloaded successfully' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message 
    });
  }
});

module.exports = app;