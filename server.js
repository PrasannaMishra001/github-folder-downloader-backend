const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Comprehensive CORS configuration
app.use(cors({
  origin: [
    'https://prasannamishra001.github.io',  // Your GitHub Pages site
    'http://localhost:3000',               // Local development
    '*'                                    // Use cautiously in production
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit preflight handling
app.options('*', cors());

// Ensure JSON parsing
app.use(express.json());

// Explicit route definition
app.post('/download', async (req, res) => {
  console.log('Download request received:', req.body);  // Logging for debugging

  const { repoUrl, folderName } = req.body;

  try {
    // Extract repo owner and name from the URL
    const match = repoUrl.match(/https:\/\/github.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GitHub URL' 
      });
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
      return res.status(404).json({ 
        success: false, 
        message: 'No files found in this folder' 
      });
    }

    // Simulate download process (adjust as needed)
    res.json({ 
      success: true, 
      message: 'Download process initiated',
      fileCount: files.length,
      files: files.map(file => file.name)
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message 
    });
  }
});

// Root route for health check
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running' });
});

module.exports = app;