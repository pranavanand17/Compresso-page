// authManager.js
export default class AuthManager {
    constructor() {
        this.authenticated = false; // simple demo state
    }

    isAuthenticated() {
        // In real app, check token/session here
        return this.authenticated;
    }

    async login(username, password) {
        // Simple demo login: username "user", password "pass"
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === 'user' && password === 'pass') {
                    this.authenticated = true;
                    resolve(true);
                } else {
                    reject(new Error('Invalid username or password'));
                }
            }, 500); // simulate async
        });
    }
}
