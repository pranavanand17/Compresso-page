import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('loggedInUser');
    if (!username) window.location.href = 'login.html';
    else document.getElementById('userGreeting').textContent = username;

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });

    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const statsGrid = document.getElementById('statsGrid');
    const clearFilesBtn = document.getElementById('clearFilesBtn');
    const pageCountBtn = document.getElementById('pageCountBtn');
    const wordCountBtn = document.getElementById('wordCountBtn');
    const previewBtn = document.getElementById('previewBtn');

    let filesToProcess = [];

    function renderFiles() {
        previewGrid.innerHTML = '';
        statsGrid.innerHTML = '';
        filesToProcess.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-card';
            div.innerHTML = `
                <p><strong>${file.name}</strong></p>
                <p>Type: ${file.type}</p>
                <p>Size: ${(file.size / 1024).toFixed(1)} KB</p>
            `;
            previewGrid.appendChild(div);
        });
    }

    fileInput.addEventListener('change', e => {
        filesToProcess = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
        renderFiles();
    });

    clearFilesBtn.addEventListener('click', () => {
        filesToProcess = [];
        fileInput.value = '';
        renderFiles();
    });

    async function extractPdfData(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + ' ';
        }
        return { pages: pdf.numPages, text };
    }

    pageCountBtn.addEventListener('click', async () => {
        statsGrid.innerHTML = '';
        for (const file of filesToProcess) {
            const { pages } = await extractPdfData(file);
            const div = document.createElement('div');
            div.className = 'stat-card';
            div.textContent = `${file.name}: ${pages} pages`;
            statsGrid.appendChild(div);
        }
    });

    wordCountBtn.addEventListener('click', async () => {
        statsGrid.innerHTML = '';
        for (const file of filesToProcess) {
            const { text } = await extractPdfData(file);
            const wordCount = text.split(/\s+/).filter(w => w).length;
            const div = document.createElement('div');
            div.className = 'stat-card';
            div.textContent = `${file.name}: ~${wordCount} words`;
            statsGrid.appendChild(div);
        }
    });

    previewBtn.addEventListener('click', async () => {
        statsGrid.innerHTML = '';
        for (const file of filesToProcess) {
            const { text } = await extractPdfData(file);
            const div = document.createElement('div');
            div.className = 'stat-card';
            div.innerHTML = `<strong>${file.name} Preview:</strong><p>${text.substring(0, 500)}...</p>`;
            statsGrid.appendChild(div);
        }
    });
});

