const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/download', async (req, res) => {
    const { repoUrl, folderName } = req.body;

    try {
        // Extract repo owner and name from the URL
        const match = repoUrl.match(/https:\/\/github.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            return res.json({ success: false, message: 'Invalid GitHub URL' });
        }

        const repoOwner = match[1];
        const repoName = match[2];
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${folderName}`;

        // Fetch folder contents from GitHub API
        const response = await axios.get(apiUrl);
        const files = response.data;

        if (!files || files.length === 0) {
            return res.json({ success: false, message: 'No files found in this folder' });
        }

        // Save files to a folder on the server (for now, simulate downloading)
        const downloadFolder = path.join(__dirname, 'downloads', folderName);
        if (!fs.existsSync(downloadFolder)) {
            fs.mkdirSync(downloadFolder, { recursive: true });
        }

        // Download all files
        for (let file of files) {
            if (file.type === 'file') {
                const fileResponse = await axios.get(file.download_url, { responseType: 'arraybuffer' });
                fs.writeFileSync(path.join(downloadFolder, file.name), fileResponse.data);
            }
        }

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
