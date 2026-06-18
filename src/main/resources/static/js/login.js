/**
 * login.js — Lógica del formulario de login
 * Depende de: Auth.js, Store.js
 */
document.addEventListener('DOMContentLoaded', () => {

    if (Auth.getSession()) {
        window.location.href = Store.getHomeByRole(Auth.getSession().role);
        return;
    }

    const CREDENTIALS = {
        supervisor: { user: 'supervisor', pass: '1234' },
        cajero:     { user: 'cajero',     pass: '1234' },
        reponedor:  { user: 'reponedor',  pass: '1234' },
        limpieza:   { user: 'limpieza',   pass: '1234' },
        admin:      { user: 'admin',      pass: 'admin' },
    };

    const form          = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const btnLogin      = document.getElementById('btnLogin');
    const btnText       = document.getElementById('btnText');
    const btnSpinner    = document.getElementById('btnSpinner');
    const loginAlert    = document.getElementById('loginAlert');
    const alertMsg      = document.getElementById('alertMsg');
    const togglePwd     = document.getElementById('togglePassword');
    const eyeIcon       = document.getElementById('eyeIcon');
    const roleBtns      = document.querySelectorAll('.role-btn');

    let selectedRole = 'supervisor';

    const yrEl = document.getElementById('year');
    if (yrEl) yrEl.textContent = new Date().getFullYear();

    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            roleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedRole = btn.dataset.role;
            loginAlert.style.display = 'none';
        });
    });

    togglePwd.addEventListener('click', () => {
        const hidden = passwordInput.type === 'password';
        passwordInput.type = hidden ? 'text' : 'password';
        eyeIcon.className  = hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (!username || !password) { showAlert('Completa todos los campos.'); return; }
        setLoading(true);
        setTimeout(() => {
            const creds = CREDENTIALS[selectedRole];
            if (username === creds.user && password === creds.pass) {
                Auth.login(username, selectedRole);
                window.location.href = Store.getHomeByRole(selectedRole);
            } else {
                showAlert(`Credenciales incorrectas para <strong>${Store.getRolLabel(selectedRole)}</strong>.`);
                passwordInput.value = '';
                passwordInput.focus();
                setLoading(false);
            }
        }, 900);
    });

    function setLoading(on) {
        btnLogin.disabled = on;
        btnText.classList.toggle('d-none', on);
        btnSpinner.classList.toggle('d-none', !on);
        loginAlert.style.display = 'none';
    }
    function showAlert(msg) {
        alertMsg.innerHTML = msg;
        loginAlert.style.display = 'block';
    }
});
