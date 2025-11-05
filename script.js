// ===== Signup & Login Logic =====
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (loginBtn) setupLogin();
    if (signupBtn) setupSignup();
});

// ===== Login =====
function setupLogin() {
    const error = document.getElementById('error');
    document.getElementById('loginBtn').addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        error.textContent = '';

        if (!username || !password) { error.textContent = 'Fill all fields'; return; }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (!users[username] || users[username].password !== password) {
            error.textContent = 'Invalid username or password';
            return;
        }

        localStorage.setItem('loggedInUser', username);
        alert('Logged in as ' + username);
        // window.location.href = 'dashboard.html'; // Optional: redirect to dashboard
    });
}

// ===== Signup =====
function setupSignup() {
    const error = document.getElementById('error');
    const success = document.getElementById('success');

    document.getElementById('signupBtn').addEventListener('click', () => {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm').value;
        error.textContent = '';
        success.textContent = '';

        if (!username || !password || !confirm) { error.textContent = 'Fill all fields'; return; }
        if (password !== confirm) { error.textContent = 'Passwords do not match'; return; }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) { error.textContent = 'Username exists'; return; }

        users[username] = { password };
        localStorage.setItem('users', JSON.stringify(users));

        success.textContent = 'Account created!';
        setTimeout(() => window.location.href = 'login.html', 1000);
    });
}

