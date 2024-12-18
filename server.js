const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Comprehensive CORS configuration
app.use(cors({
  origin: [
    'https://prasannamishra001.github.io',
    'http://localhost:3000',
    '*'  // Be cautious in production
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit route for download
app.post('/api/download', async (req, res) => {
  console.log('Received download request:', req.body);

  const { repoUrl, folderName } = req.body;

  try {
    // Validate GitHub URL
    const match = repoUrl.match(/https:\/\/github.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GitHub Repository URL' 
      });
    }

    const repoOwner = match[1];
    const repoName = match[2];
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderName}`;

    // Fetch folder contents
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const files = response.data;

    if (!files || files.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No files found in specified folder' 
      });
    }

    // Return file information
    res.json({ 
      success: true, 
      message: 'Repository folder contents retrieved',
      fileCount: files.length,
      files: files.map(file => ({
        name: file.name,
        path: file.path,
        type: file.type
      }))
    });

  } catch (error) {
    console.error('Detailed download error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || 'Internal server error',
      errorDetails: error.toString()
    });
  }
});

// Health check route
app.get('/api', (req, res) => {
  res.json({ 
    status: 'Backend is running', 
    timestamp: new Date().toISOString() 
  });
});

module.exports = app;