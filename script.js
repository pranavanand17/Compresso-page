import {
    compressPDF,
    mergePDFs,
    generateSmartFileName,
    formatFileSize,
    downloadPDF,
    getPDFPageCount,
    arrayBufferToBase64,
    base64ToArrayBuffer
} from './pdfUtils.js';

class AuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
    }

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    async signup(username, password) {
        const users = this.getUsers();

        if (users[username]) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await this.hashPassword(password);
        users[username] = {
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('pdfzap_users', JSON.stringify(users));
        return true;
    }

    async login(username, password) {
        const users = this.getUsers();

        if (!users[username]) {
            throw new Error('Invalid username or password');
        }

        const hashedPassword = await this.hashPassword(password);

        if (users[username].password !== hashedPassword) {
            throw new Error('Invalid username or password');
        }

        localStorage.setItem('pdfzap_currentUser', username);
        this.currentUser = username;
        return true;
    }

    logout() {
        localStorage.removeItem('pdfzap_currentUser');
        this.currentUser = null;
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return localStorage.getItem('pdfzap_currentUser');
    }

    getUsers() {
        const usersJson = localStorage.getItem('pdfzap_users');
        return usersJson ? JSON.parse(usersJson) : {};
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

class HistoryManager {
    constructor(username) {
        this.username = username;
        this.storageKey = `pdfzap_history_${username}`;
    }

    addEntry(fileName, type, fileData, originalSize, processedSize) {
        const history = this.getHistory();
        const entry = {
            id: Date.now().toString(),
            fileName,
            type,
            date: new Date().toISOString(),
            originalSize,
            processedSize,
            fileData: arrayBufferToBase64(fileData)
        };

        history.unshift(entry);

        if (history.length > 50) {
            history.splice(50);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(history));
        return entry;
    }

    getHistory() {
        const historyJson = localStorage.getItem(this.storageKey);
        return historyJson ? JSON.parse(historyJson) : [];
    }

    deleteEntry(id) {
        let history = this.getHistory();
        history = history.filter(entry => entry.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }

    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }

    downloadFromHistory(id) {
        const history = this.getHistory();
        const entry = history.find(e => e.id === id);

        if (entry) {
            const fileData = base64ToArrayBuffer(entry.fileData);
            downloadPDF(fileData, entry.fileName);
        }
    }
}

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('pdfzap_theme') || 'light';
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('pdfzap_theme', this.theme);
        this.applyTheme();
    }
}

const authManager = new AuthManager();
const themeManager = new ThemeManager();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => themeManager.toggle());
    }

    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        initLoginPage();
    } else if (window.location.pathname.includes('signup.html')) {
        initSignupPage();
    } else if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    }
});

function initLoginPage() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.remove('show');
        errorMessage.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            await authManager.login(username, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.add('show');
        }
    });
}

function initSignupPage() {
    if (authManager.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.classList.remove('show');
        successMessage.classList.remove('show');
        errorMessage.textContent = '';
        successMessage.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match';
            errorMessage.classList.add('show');
            return;
        }

        try {
            await authManager.signup(username, password);
            successMessage.textContent = 'Account created successfully! Redirecting...';
            successMessage.classList.add('show');

            setTimeout(async () => {
                await authManager.login(username, password);
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.add('show');
        }
    });
}

function initDashboard() {
    if (!authManager.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const historyManager = new HistoryManager(authManager.currentUser);
    let currentFiles = [];
    let currentOperation = null;

    const userGreeting = document.getElementById('userGreeting');
    userGreeting.textContent = `Welcome, ${authManager.currentUser}`;

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => authManager.logout());

    const compressInput = document.getElementById('compressInput');
    const mergeInput = document.getElementById('mergeInput');
    const previewSection = document.getElementById('previewSection');
    const previewGrid = document.getElementById('previewGrid');
    const clearPreview = document.getElementById('clearPreview');
    const processBtn = document.getElementById('processBtn');
    const outputFileName = document.getElementById('outputFileName');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');

    compressInput.addEventListener('change', (e) => handleFileSelection(e.target.files, 'compress'));
    mergeInput.addEventListener('change', (e) => handleFileSelection(e.target.files, 'merge'));
    clearPreview.addEventListener('click', clearCurrentFiles);
    processBtn.addEventListener('click', processFiles);

    async function handleFileSelection(files, operation) {
        if (files.length === 0) return;

        currentOperation = operation;
        currentFiles = Array.from(files);

        previewSection.classList.remove('hidden');
        previewGrid.innerHTML = '';

        for (const file of currentFiles) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileData = e.target.result;
                const pageCount = await getPDFPageCount(fileData);

                const previewCard = document.createElement('div');
                previewCard.className = 'preview-card';
                previewCard.innerHTML = `
                    <div class="preview-thumbnail">
                        <div class="pdf-placeholder">📄</div>
                    </div>
                    <div class="preview-info">
                        <div class="file-name" title="${file.name}">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)} • ${pageCount} pages</div>
                    </div>
                `;
                previewGrid.appendChild(previewCard);
            };
            reader.readAsArrayBuffer(file);
        }

        const fileNames = currentFiles.map(f => f.name);
        const smartName = generateSmartFileName(fileNames);
        outputFileName.value = smartName;

        if (operation === 'compress' && currentFiles.length === 1) {
            outputFileName.value = currentFiles[0].name.replace('.pdf', '_compressed');
        }
    }

    function clearCurrentFiles() {
        currentFiles = [];
        currentOperation = null;
        previewSection.classList.add('hidden');
        previewGrid.innerHTML = '';
        outputFileName.value = '';
        compressInput.value = '';
        mergeInput.value = '';
    }

    async function processFiles() {
        if (currentFiles.length === 0) return;

        showLoader(currentOperation === 'compress' ? 'Compressing...' : 'Merging...');

        try {
            if (currentOperation === 'compress') {
                await compressFiles();
            } else if (currentOperation === 'merge') {
                await mergeFiles();
            }
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            hideLoader();
        }
    }

    async function compressFiles() {
        const file = currentFiles[0];
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const result = await compressPDF(e.target.result, file.name);

                const fileName = outputFileName.value.trim() || result.fileName;
                const finalFileName = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';

                downloadPDF(result.data, finalFileName);

                historyManager.addEntry(
                    finalFileName,
                    'compress',
                    result.data,
                    result.originalSize,
                    result.compressedSize
                );

                renderHistory();
                clearCurrentFiles();
            } catch (error) {
                throw error;
            }
        };

        reader.readAsArrayBuffer(file);
    }

    async function mergeFiles() {
        const filesData = [];

        for (const file of currentFiles) {
            const data = await readFileAsArrayBuffer(file);
            filesData.push({ data, name: file.name });
        }

        const result = await mergePDFs(filesData);

        const fileName = outputFileName.value.trim() || 'merged_document';
        const finalFileName = fileName.endsWith('.pdf') ? fileName : fileName + '.pdf';

        downloadPDF(result.data, finalFileName);

        const totalOriginalSize = currentFiles.reduce((sum, f) => sum + f.size, 0);

        historyManager.addEntry(
            finalFileName,
            'merge',
            result.data,
            totalOriginalSize,
            result.data.byteLength
        );

        renderHistory();
        clearCurrentFiles();
    }

    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    function showLoader(text) {
        loaderText.textContent = text;
        loader.classList.remove('hidden');
    }

    function hideLoader() {
        loader.classList.add('hidden');
    }

    function renderHistory() {
        const historyList = document.getElementById('historyList');
        const history = historyManager.getHistory();

        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v4"/>
                        <polyline points="17 3 17 8 22 8"/>
                        <circle cx="17" cy="17" r="5"/>
                        <path d="M17 14v6l3 2"/>
                    </svg>
                    <p>No history yet. Start processing PDFs!</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = history.map(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            const time = new Date(entry.date).toLocaleTimeString();
            const savings = entry.originalSize > entry.processedSize
                ? `Saved ${formatFileSize(entry.originalSize - entry.processedSize)}`
                : '';

            return `
                <div class="history-item" data-id="${entry.id}">
                    <div class="history-info">
                        <div class="file-name">${entry.fileName}</div>
                        <div class="history-meta">
                            <span class="history-badge badge-${entry.type}">${entry.type === 'compress' ? 'Compressed' : 'Merged'}</span>
                            <span>${date} ${time}</span>
                            ${savings ? `<span>${savings}</span>` : ''}
                        </div>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-secondary btn-icon" onclick="window.downloadHistoryItem('${entry.id}')" title="Download">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        <button class="btn btn-secondary btn-icon" onclick="window.deleteHistoryItem('${entry.id}')" title="Delete">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.downloadHistoryItem = (id) => {
        historyManager.downloadFromHistory(id);
    };

    window.deleteHistoryItem = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            historyManager.deleteEntry(id);
            renderHistory();
        }
    };

    const clearHistory = document.getElementById('clearHistory');
    clearHistory.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
            historyManager.clearHistory();
            renderHistory();
        }
    });

    renderHistory();
}
