/**
 * Auth.js — Manejo de sesión global
 * Incluir SIEMPRE antes que cualquier otro JS de página
 */
class Auth {

    static SESSION_KEY = 'timeforge_session';

    static login(username, role) {
        const session = { username, role, loginAt: new Date().toISOString() };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    static logout() {
        sessionStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    }

    static getSession() {
        const raw = sessionStorage.getItem(this.SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    /** Redirige al login si no hay sesión. Llamar al inicio de cada página protegida. */
    static requireAuth() {
        if (!this.getSession()) {
            window.location.href = 'login.html';
        }
    }

    /** Redirige al login si no hay sesión O si el rol no está permitido. */
    static requireRole(...roles) {
        const session = this.getSession();
        if (!session || !roles.includes(session.role)) {
            window.location.href = 'login.html';
        }
    }
}
