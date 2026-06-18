/**
 * admin.js — Panel de Administrador
 * Depende de: Auth.js, Store.js
 */
document.addEventListener('DOMContentLoaded', () => {

    Auth.requireRole('admin');

    const session = Auth.getSession();
    setSessionUI(session);

    // Cerrar sesión
    document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());

    // Sidebar toggle
    const wrapper = document.getElementById('wrapper');
    document.getElementById('menu-toggle').addEventListener('click', () => wrapper.classList.toggle('toggled'));

    // Navegación SPA
    initNav();

    // Renderizar secciones
    renderEmployees();
    renderSchedules();
    renderDashboard();

    // Formulario agregar empleado
    document.getElementById('formAddEmployee').addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('emp-nombre').value.trim();
        const rol    = document.getElementById('emp-rol').value;
        const tipo   = document.getElementById('emp-tipo').value;
        const horas  = parseInt(document.getElementById('emp-horas').value);

        if (!nombre) return;

        Store.addEmployee({ nombre, rol, tipo, horas });
        e.target.reset();
        renderEmployees();
        renderSchedules(); // actualiza lista de empleados en horarios
        showToast('Empleado agregado correctamente.');
    });

    // Formulario agregar horario fijo
    document.getElementById('formAddSchedule').addEventListener('submit', (e) => {
        e.preventDefault();
        const empleadoId = parseInt(document.getElementById('sch-empleado').value);
        const dia        = document.getElementById('sch-dia').value;
        const hora       = document.getElementById('sch-hora').value;

        Store.addSchedule({ empleadoId, dia, hora, tipo: 'fijo' });
        e.target.reset();
        renderSchedules();
        showToast('Horario fijo registrado.');
    });

    /* ── RENDER EMPLEADOS ── */
    function renderEmployees() {
        const employees = Store.getEmployees();
        const tbody = document.getElementById('tabla-empleados');
        tbody.innerHTML = '';

        employees.forEach(emp => {
            const color = Store.getRolColor(emp.rol);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.nombre}</td>
                <td><span class="badge bg-${color}">${Store.getRolLabel(emp.rol)}</span></td>
                <td><span class="badge ${emp.tipo === 'fijo' ? 'bg-secondary' : 'bg-success'}">${emp.tipo}</span></td>
                <td>${emp.horas}h/sem</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" data-id="${emp.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tr.querySelector('button').addEventListener('click', () => {
                if (confirm(`¿Eliminar a ${emp.nombre}?`)) {
                    Store.deleteEmployee(emp.id);
                    renderEmployees();
                    renderSchedules();
                }
            });
            tbody.appendChild(tr);
        });

        // Actualizar select de empleado en formulario de horarios
        const sel = document.getElementById('sch-empleado');
        if (sel) {
            sel.innerHTML = '<option value="">Selecciona empleado</option>';
            employees.forEach(emp => {
                const opt = document.createElement('option');
                opt.value = emp.id;
                opt.textContent = `${emp.nombre} (${Store.getRolLabel(emp.rol)})`;
                sel.appendChild(opt);
            });
        }
    }

    /* ── RENDER HORARIOS ── */
    function renderSchedules() {
        const schedules  = Store.getSchedules();
        const employees  = Store.getEmployees();
        const tbody      = document.getElementById('tabla-horarios');
        tbody.innerHTML  = '';

        schedules.forEach(sch => {
            const emp = employees.find(e => e.id === sch.empleadoId);
            if (!emp) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.nombre}</td>
                <td>${sch.dia}</td>
                <td>${sch.hora}</td>
                <td><span class="badge bg-secondary">${sch.tipo}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" data-id="${sch.id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tr.querySelector('button').addEventListener('click', () => {
                Store.deleteSchedule(sch.id);
                renderSchedules();
            });
            tbody.appendChild(tr);
        });
    }

    /* ── RENDER DASHBOARD ── */
    function renderDashboard() {
        const employees = Store.getEmployees();
        document.getElementById('total-empleados').textContent = employees.length;
        document.getElementById('total-fijos').textContent     = employees.filter(e => e.tipo === 'fijo').length;
        document.getElementById('total-flex').textContent      = employees.filter(e => e.tipo === 'flexible').length;
        document.getElementById('total-cajeros').textContent   = employees.filter(e => e.rol === 'cajero').length;
    }

    /* ── NAV ── */
    function initNav() {
        const navLinks    = document.querySelectorAll('#sidebar-wrapper .list-group-item');
        const sections    = document.querySelectorAll('.view-section');
        const tituloVista = document.getElementById('vista-titulo');
        const titulos = {
            'sec-dashboard': 'Resumen General',
            'sec-empleados': 'Gestión de Empleados',
            'sec-horarios':  'Gestión de Horarios Fijos',
        };
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(n => n.classList.remove('active'));
                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                sections.forEach(s => { s.style.display = 'none'; });
                const active = document.getElementById(targetId);
                if (active) active.style.display = 'block';
                if (tituloVista && titulos[targetId]) tituloVista.textContent = titulos[targetId];
            });
        });
    }

    /* ── SESSION UI ── */
    function setSessionUI(session) {
        const el = document.getElementById('session-username');
        const rl = document.getElementById('session-role');
        if (el) el.textContent = session.username;
        if (rl) rl.textContent = Store.getRolLabel(session.role);
    }

    /* ── TOAST ── */
    function showToast(msg) {
        const t = document.getElementById('toast-msg');
        if (!t) return;
        t.querySelector('.toast-body').textContent = msg;
        const bsToast = new bootstrap.Toast(t, { delay: 2500 });
        bsToast.show();
    }
});
