// script.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const dashboardContainer = document.querySelector('.dashboard-container');

    if (loginForm) {
        initLoginPage();
    } else if (signupForm) {
        initSignupPage();
    } else if (dashboardContainer) {
        initDashboard(); // PDF features handled inside
    }

    initThemeToggle();
});

// ===== LOGIN =====
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            errorMessage.textContent = 'Please fill in all fields';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[username] || users[username].password !== password) {
            errorMessage.textContent = 'Invalid username or password';
            return;
        }

        localStorage.setItem('loggedInUser', username);
        window.location.href = 'dashboard.html';
    });
}

// ===== SIGNUP =====
function initSignupPage() {
    const form = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        successMessage.textContent = '';

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirmPassword').value;

        if (!username || !password || !confirm) {
            errorMessage.textContent = 'All fields are required';
            return;
        }

        if (password !== confirm) {
            errorMessage.textContent = 'Passwords do not match';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            errorMessage.textContent = 'Username already exists';
            return;
        }

        users[username] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        successMessage.textContent = 'Account created! Redirecting...';

        setTimeout(() => window.location.href = 'login.html', 1500);
    });
}

// ===== THEME TOGGLE =====
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    const darkMode = localStorage.getItem('darkMode') === 'true';
    setTheme(darkMode);

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDark);
    });
}

function setTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
}

// ===== DASHBOARD =====
async function initDashboard() {
    const username = localStorage.getItem('loggedInUser');
    if (!username) {
        window.location.href = 'login.html';
        return;
    }

    const userGreeting = document.getElementById('userGreeting');
    userGreeting.textContent = `Hello, ${username}`;

    const { PDFDocument } = await import('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });

    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const clearPreview = document.getElementById('clearPreview');

    let filesToProcess = [];

    function handleFiles(files) {
        previewGrid.innerHTML = '';
        filesToProcess = [];

        Array.from(files).forEach(file => {
            if (file.type !== 'application/pdf') return;

            filesToProcess.push(file);
            const div = document.createElement('div');
            div.className = 'preview-card';
            div.innerHTML = `<p>${file.name}</p><small>${(file.size / 1024).toFixed(1)} KB</small>`;
            previewGrid.appendChild(div);
        });
    }

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    clearPreview.addEventListener('click', () => {
        filesToProcess = [];
        previewGrid.innerHTML = '';
    });

    // PDF feature buttons
    const pageCountBtn = document.getElementById('pageCountBtn');
    const wordCountBtn = document.getElementById('wordCountBtn');
    const previewBtn = document.getElementById('previewBtn');

    pageCountBtn.addEventListener('click', async () => {
        for (const file of filesToProcess) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            alert(`${file.name}: ${pdfDoc.getPageCount()} pages`);
        }
    });

    wordCountBtn.addEventListener('click', async () => {
        for (const file of filesToProcess) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            let text = '';
            for (const page of pages) text += page.getTextContent ? await page.getTextContent() : '';
            const wordCount = text ? text.split(/\s+/).length : 'N/A';
            alert(`${file.name}: ~${wordCount} words`);
        }
    });

    previewBtn.addEventListener('click', async () => {
        for (const file of filesToProcess) {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = pdfDoc.getPages();
            let text = '';
            for (const page of pages) text += page.getTextContent ? await page.getTextContent() : '';
            alert(`${file.name} preview:\n${text.substring(0, 500)}...`);
        }
    });
}

