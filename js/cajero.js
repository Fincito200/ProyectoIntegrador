/**
 * cajero.js — Panel de Cajero (solo lectura de sus turnos)
 * Depende de: Auth.js, Store.js
 */
document.addEventListener('DOMContentLoaded', () => {

    Auth.requireRole('cajero');

    const session = Auth.getSession();
    setSessionUI(session);

    document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());

    const wrapper = document.getElementById('wrapper');
    document.getElementById('menu-toggle').addEventListener('click', () => wrapper.classList.toggle('toggled'));

    initNav();
    renderMiHorario();
    renderResumen();

    function renderMiHorario() {
        const DIAS  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
        const HORAS = ['08:00','10:00','14:00','18:00'];

        const schedules = Store.getSchedules();
        const employees = Store.getEmployees();

        // Buscar el empleado que coincida con el username de sesión
        const miEmpleado = employees.find(e =>
            e.nombre.toLowerCase().includes(session.username.toLowerCase()) || e.rol === 'cajero'
        );

        const miId = miEmpleado ? miEmpleado.id : null;
        const misTurnos = schedules.filter(s => s.empleadoId === miId);

        // Tabla personal
        const tbody = document.getElementById('mi-calendario-body');
        tbody.innerHTML = '';

        let totalHoras = 0;

        HORAS.forEach(hora => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="fw-bold text-muted border-end">${hora}</td>`;

            DIAS.forEach(dia => {
                const sch = misTurnos.find(s => s.hora === hora && s.dia === dia);
                const td  = document.createElement('td');
                td.className = 'p-1 text-center';

                if (sch) {
                    totalHoras += 4; // cada bloque = ~4h
                    const color = sch.tipo === 'fijo' ? 'bg-primary' : 'bg-success';
                    const icon  = sch.tipo === 'fijo' ? 'fa-lock' : 'fa-grip-vertical';
                    td.innerHTML = `<div class="${color} text-white p-2 rounded small"><i class="fa-solid ${icon} me-1"></i>${hora}</div>`;
                } else {
                    td.innerHTML = `<span class="text-muted small">-</span>`;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Total horas
        const totalEl = document.getElementById('mis-horas');
        if (totalEl) totalEl.textContent = totalHoras + 'h';
    }

    function renderResumen() {
        const schedules = Store.getSchedules();
        const session   = Auth.getSession();
        const employees = Store.getEmployees();
        const miEmpleado = employees.find(e => e.rol === 'cajero');

        const misT = miEmpleado ? schedules.filter(s => s.empleadoId === miEmpleado.id) : [];
        const dias  = [...new Set(misT.map(s => s.dia))];

        document.getElementById('res-turnos').textContent = misT.length;
        document.getElementById('res-dias').textContent   = dias.length;
        document.getElementById('res-tipo').textContent   = miEmpleado ? Store.getRolLabel(miEmpleado.tipo === 'fijo' ? 'fijo' : 'flexible') : '-';
    }

    function initNav() {
        const navLinks    = document.querySelectorAll('#sidebar-wrapper .list-group-item');
        const sections    = document.querySelectorAll('.view-section');
        const tituloVista = document.getElementById('vista-titulo');
        const titulos = {
            'sec-mihorario': 'Mi Horario Semanal',
            'sec-resumen':   'Mi Resumen',
        };
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(n => n.classList.remove('active'));
                link.classList.add('active');
                const targetId = link.getAttribute('data-target');
                sections.forEach(s => s.style.display = 'none');
                const active = document.getElementById(targetId);
                if (active) active.style.display = 'block';
                if (tituloVista && titulos[targetId]) tituloVista.textContent = titulos[targetId];
            });
        });
    }

    function setSessionUI(session) {
        const el = document.getElementById('session-username');
        const rl = document.getElementById('session-role');
        if (el) el.textContent = session.username;
        if (rl) rl.textContent = Store.getRolLabel(session.role);
    }
});
