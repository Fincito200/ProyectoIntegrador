document.addEventListener('DOMContentLoaded', () => {

    Auth.requireRole('reponedor');
    const session = Auth.getSession();
    setSessionUI(session);

    document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());
    document.getElementById('menu-toggle').addEventListener('click', () =>
        document.getElementById('wrapper').classList.toggle('toggled'));

    initNav();
    renderMiHorario();
    renderResumen();
    renderMisTickets();

    document.getElementById('btn-crear-ticket').addEventListener('click', () => {
        const titulo      = document.getElementById('tk-titulo').value.trim();
        const categoria   = document.getElementById('tk-categoria').value;
        const prioridad   = document.getElementById('tk-prioridad').value;
        const descripcion = document.getElementById('tk-descripcion').value.trim();
        if (!titulo || !descripcion) { alert('Completa el título y la descripción.'); return; }
        Store.addTicket({ titulo, categoria, prioridad, descripcion, rol: 'reponedor', autor: session.username });
        document.getElementById('tk-titulo').value = '';
        document.getElementById('tk-descripcion').value = '';
        const ok = document.getElementById('tk-success');
        ok.classList.remove('d-none');
        setTimeout(() => ok.classList.add('d-none'), 3000);
        renderMisTickets();
    });

    function renderMisTickets() {
        const tickets = Store.getTickets().filter(t => t.rol === 'reponedor');
        const contenedor = document.getElementById('lista-mis-tickets');
        if (!tickets.length) { contenedor.innerHTML = '<p class="text-muted text-center py-3">No tienes tickets aún.</p>'; return; }
        const prioColor = { Alta: 'danger', Media: 'warning', Baja: 'success' };
        contenedor.innerHTML = tickets.map(t => `
            <div class="ticket-item">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <strong>${t.titulo}</strong>
                    <span class="ticket-badge-${t.estado}">${t.estado.charAt(0).toUpperCase()+t.estado.slice(1)}</span>
                </div>
                <div class="text-muted small mb-1">${t.descripcion}</div>
                <div class="d-flex gap-2">
                    <span class="badge bg-${prioColor[t.prioridad]||'secondary'}">${t.prioridad}</span>
                    <span class="badge bg-light text-dark border">${t.categoria}</span>
                    <span class="text-muted small ms-auto">${new Date(t.fecha).toLocaleDateString('es-PE')}</span>
                </div>
            </div>`).join('');
    }

    function renderMiHorario() {
        const DIAS  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
        const HORAS = ['08:00','10:00','14:00','18:00'];
        const schedules  = Store.getSchedules();
        const employees  = Store.getEmployees();
        const miEmpleado = employees.find(e => e.nombre.toLowerCase().includes(session.username.toLowerCase()) || e.rol === 'reponedor');
        const miId = miEmpleado ? miEmpleado.id : null;
        const misTurnos = schedules.filter(s => s.empleadoId === miId);
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
                if (sch) { totalHoras += 4; td.innerHTML = `<div class="bg-success text-white p-2 rounded small"><i class="fa-solid fa-lock me-1"></i>${hora}</div>`; }
                else td.innerHTML = `<span class="text-muted small">-</span>`;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        const el = document.getElementById('mis-horas');
        if (el) el.textContent = totalHoras + 'h';
    }

    function renderResumen() {
        const schedules  = Store.getSchedules();
        const employees  = Store.getEmployees();
        const miEmpleado = employees.find(e => e.rol === 'reponedor');
        const misT = miEmpleado ? schedules.filter(s => s.empleadoId === miEmpleado.id) : [];
        const dias  = [...new Set(misT.map(s => s.dia))];
        document.getElementById('res-turnos').textContent = misT.length;
        document.getElementById('res-dias').textContent   = dias.length;
        document.getElementById('res-tipo').textContent   = miEmpleado ? (miEmpleado.tipo === 'fijo' ? 'Fijo' : 'Flexible') : '-';
    }

    function initNav() {
        const navLinks    = document.querySelectorAll('#sidebar-wrapper .list-group-item');
        const sections    = document.querySelectorAll('.view-section');
        const tituloVista = document.getElementById('vista-titulo');
        const titulos = { 'sec-mihorario': 'Mi Horario Semanal', 'sec-tickets': 'Mis Tickets', 'sec-resumen': 'Mi Resumen' };
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
                if (targetId === 'sec-tickets') renderMisTickets();
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