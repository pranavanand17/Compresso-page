// fileManager.js
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('loggedInUser');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    const userGreeting = document.getElementById('userGreeting');
    userGreeting.textContent = username;

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });

    const fileInput = document.getElementById('fileInput');
    const clearFilesBtn = document.getElementById('clearFilesBtn');
    const previewSection = document.getElementById('previewSection');
    const previewGrid = document.getElementById('previewGrid');
    const generateReportBtn = document.getElementById('generateReportBtn');

    let uploadedFiles = [];

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function generateFakeCompression(file) {
        // Random 10–50% “compressibility”
        return Math.floor(Math.random() * 40) + 10;
    }

    function renderFiles() {
        previewGrid.innerHTML = '';
        uploadedFiles.forEach(fileObj => {
            const div = document.createElement('div');
            div.className = 'preview-card';
            div.innerHTML = `
                <p><strong>${fileObj.file.name}</strong></p>
                <p>Type: ${fileObj.file.type || 'Unknown'}</p>
                <p>Size: ${formatFileSize(fileObj.file.size)}</p>
                <p>Potential Compression: ${fileObj.fakeCompression}%</p>
            `;
            previewGrid.appendChild(div);
        });

        if (uploadedFiles.length > 0) {
            previewSection.classList.remove('hidden');
        } else {
            previewSection.classList.add('hidden');
        }
    }

    fileInput.addEventListener('change', (e) => {
        Array.from(e.target.files).forEach(file => {
            const fileObj = {
                file,
                fakeCompression: generateFakeCompression(file)
            };
            uploadedFiles.push(fileObj);
        });
        renderFiles();
    });

    clearFilesBtn.addEventListener('click', () => {
        uploadedFiles = [];
        fileInput.value = '';
        renderFiles();
    });

    generateReportBtn.addEventListener('click', () => {
        if (!uploadedFiles.length) return;

        let report = `MultiFormat Analyzer Report - User: ${username}\n\n`;
        uploadedFiles.forEach(f => {
            report += `File: ${f.file.name}\n`;
            report += `Type: ${f.file.type || 'Unknown'}\n`;
            report += `Size: ${formatFileSize(f.file.size)}\n`;
            report += `Estimated Compressibility: ${f.fakeCompression}%\n`;
            report += `--------------------------\n`;
        });

        const blob = new Blob([report], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'FileReport.txt';
        link.click();
    });
});

