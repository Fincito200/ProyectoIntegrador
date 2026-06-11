document.addEventListener('DOMContentLoaded', () => {

    Auth.requireRole('supervisor');
    const session = Auth.getSession();
    setSessionUI(session);

    document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());
    document.getElementById('menu-toggle').addEventListener('click', () =>
        document.getElementById('wrapper').classList.toggle('toggled'));

    initNav();
    renderTickets('todos');
    renderCalendario();
    renderEmpleadosLateral();

    // Formulario horario fijo
    document.getElementById('formAddSchedule').addEventListener('submit', (e) => {
        e.preventDefault();
        const empleadoId = parseInt(document.getElementById('sch-empleado').value);
        const dia        = document.getElementById('sch-dia').value;
        const hora       = document.getElementById('sch-hora').value;
        if (!empleadoId) { showToast('Selecciona un empleado.', 'warning'); return; }
        try {
            Store.addSchedule({ empleadoId, dia, hora, tipo: 'fijo' });
            e.target.reset();
            renderCalendario();
            showToast('Horario fijo agregado.', 'success');
        } catch (error) {
            showToast(error.message, 'danger');
        }
    });

    // Filtros de tickets
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTickets(btn.dataset.filtro);
        });
    });

    /* ── TICKETS ── */
    function renderTickets(filtro) {
        let tickets = Store.getTickets();
        if (filtro !== 'todos') {
            // puede ser un rol o un estado
            tickets = tickets.filter(t => t.rol === filtro || t.estado === filtro);
        }
        const contenedor = document.getElementById('lista-tickets-supervisor');
        if (!tickets.length) {
            contenedor.innerHTML = '<div class="text-muted text-center py-5"><i class="fa-solid fa-inbox fs-1 mb-3 d-block"></i>No hay tickets en esta categoría.</div>';
            return;
        }
        const rolIcon = { cajero: 'fa-cash-register', reponedor: 'fa-boxes-stacked', limpieza: 'fa-broom' };
        const prioColor = { Alta: 'danger', Media: 'warning', Baja: 'success' };
        const rolColor  = { cajero: '#4f46e5', reponedor: '#059669', limpieza: '#7c3aed' };
        contenedor.innerHTML = tickets.map(t => `
            <div class="ticket-supervisor" style="border-left: 4px solid ${rolColor[t.rol]||'#94a3b8'};">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <strong>${t.titulo}</strong>
                        <div class="text-muted small mt-1">${t.descripcion}</div>
                    </div>
                    <span class="ticket-badge-${t.estado} ms-3">${t.estado.charAt(0).toUpperCase()+t.estado.slice(1)}</span>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="badge" style="background:${rolColor[t.rol]||'#64748b'}"><i class="fa-solid ${rolIcon[t.rol]||'fa-user'} me-1"></i>${t.rol.charAt(0).toUpperCase()+t.rol.slice(1)}</span>
                    <span class="badge bg-${prioColor[t.prioridad]||'secondary'}">${t.prioridad}</span>
                    <span class="badge bg-light text-dark border">${t.categoria}</span>
                    <span class="text-muted small">por ${t.autor}</span>
                    <span class="text-muted small">${new Date(t.fecha).toLocaleDateString('es-PE')}</span>
                    <div class="ms-auto d-flex gap-1">
                        ${t.estado !== 'proceso'   ? `<button class="btn-estado btn-estado-proceso"  onclick="cambiarEstado(${t.id},'proceso')">En proceso</button>` : ''}
                        ${t.estado !== 'resuelto'  ? `<button class="btn-estado btn-estado-resuelto" onclick="cambiarEstado(${t.id},'resuelto')">Resuelto</button>` : ''}
                    </div>
                </div>
            </div>`).join('');
    }

    // Exponer globalmente para los onclick
    window.cambiarEstado = function(id, estado) {
        Store.updateTicketEstado(id, estado);
        const filtroActivo = document.querySelector('.filter-tab.active');
        renderTickets(filtroActivo ? filtroActivo.dataset.filtro : 'todos');
        showToast(`Ticket marcado como "${estado}".`, 'success');
    };

    /* ── RENDER CALENDARIO ── */
    function renderCalendario() {
        const DIAS   = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
        const HORAS  = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'];
        const schedules = Store.getSchedules();
        const employees = Store.getEmployees();

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

        const tbody = document.getElementById('calendario-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        HORAS.forEach(hora => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="fw-bold text-muted border-end">${hora}</td>`;
            DIAS.forEach(dia => {
                const sch = schedules.find(s => s.hora === hora && s.dia === dia);
                const td  = document.createElement('td');
                td.className = 'p-1';
                if (sch) {
                    const emp = employees.find(e => e.id === sch.empleadoId);
                    td.innerHTML = `
                        <div class="turno-fijo p-2 rounded text-white shadow-sm d-flex align-items-center justify-content-between">
                            <span><i class="fa-solid fa-lock small me-1"></i>${emp ? emp.nombre : '?'}</span>
                            <span class="remove-sch" data-id="${sch.id}" style="cursor:pointer;opacity:0.7;font-size:0.75rem;">✕</span>
                        </div>`;
                    td.querySelector('.remove-sch').addEventListener('click', function() {
                        Store.deleteSchedule(parseInt(this.dataset.id));
                        renderCalendario();
                    });
                } else {
                    td.classList.add('drop-zone', 'bg-light');
                    td.dataset.hora = hora;
                    td.dataset.dia  = dia;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        initDragAndDrop();
    }

    function renderEmpleadosLateral() {
        const employees = Store.getEmployees();
        const fijos = employees.filter(e => e.tipo === 'fijo');
        const flex  = employees.filter(e => e.tipo === 'flexible');
        const listFijos = document.getElementById('list-fijos');
        if (listFijos) listFijos.innerHTML = fijos.map(e => `
            <div class="list-group-item p-2 small">
                <i class="fa-regular fa-user me-1"></i> ${e.nombre}
                <span class="badge bg-${Store.getRolColor(e.rol)} ms-1" style="font-size:0.65rem;">${Store.getRolLabel(e.rol)}</span>
            </div>`).join('');
        const listFlex = document.getElementById('list-flex');
        if (listFlex) listFlex.innerHTML = flex.map(e => `
            <div class="list-group-item p-2 small border-start border-success border-4 empleado-drag"
                 data-nombre="${e.nombre}" data-id="${e.id}" draggable="true">
                <i class="fa-solid fa-grip-vertical text-muted me-2"></i>${e.nombre}
                <span class="badge bg-${Store.getRolColor(e.rol)} ms-1" style="font-size:0.65rem;">${Store.getRolLabel(e.rol)}</span>
            </div>`).join('');
        initDragAndDrop();
    }

    function initDragAndDrop() {
        let draggedName = '';
        let draggedId   = null;
        document.querySelectorAll('.empleado-drag').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.addEventListener('dragstart', (e) => {
                draggedName = el.dataset.nombre;
                draggedId   = parseInt(el.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => el.classList.add('dragging'), 0);
            });
            el.addEventListener('dragend', () => el.classList.remove('dragging'));
        });
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => { e.preventDefault(); if (!zone.querySelector('.turno-flexible')) zone.classList.add('drop-hover'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drop-hover'));
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drop-hover');
                if (zone.querySelector('.turno-flexible')) return;
                try {
                    const nuevoTurno = Store.addSchedule({ empleadoId: draggedId, dia: zone.dataset.dia, hora: zone.dataset.hora, tipo: 'flexible' });
                    const turno = document.createElement('div');
                    turno.className = 'turno-flexible p-2 rounded text-white shadow-sm d-flex align-items-center justify-content-between';
                    turno.innerHTML = `
                        <span><i class="fa-solid fa-grip-vertical small me-1"></i>${draggedName}</span>
                        <span class="remove-turno" data-id="${nuevoTurno.id}" style="cursor:pointer;opacity:0.7;font-size:0.75rem;">✕</span>`;
                    zone.appendChild(turno);
                    zone.classList.remove('drop-zone', 'bg-light');
                    turno.querySelector('.remove-turno').addEventListener('click', function() {
                        Store.deleteSchedule(parseInt(this.dataset.id));
                        turno.remove();
                        zone.classList.add('drop-zone', 'bg-light');
                    });
                    showToast('Turno flexible asignado.', 'success');
                } catch (error) {
                    showToast(error.message, 'danger');
                }
            });
        });
    }

    function initNav() {
        const navLinks    = document.querySelectorAll('#sidebar-wrapper .list-group-item');
        const sections    = document.querySelectorAll('.view-section');
        const tituloVista = document.getElementById('vista-titulo');
        const titulos = { 'sec-tickets': 'Tickets Recibidos', 'sec-horarios': 'Constructor de Horarios', 'sec-agregar': 'Agregar Horario Fijo' };
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
                if (targetId === 'sec-horarios') { renderCalendario(); renderEmpleadosLateral(); }
                if (targetId === 'sec-tickets') {
                    const filtroActivo = document.querySelector('.filter-tab.active');
                    renderTickets(filtroActivo ? filtroActivo.dataset.filtro : 'todos');
                }
            });
        });
    }

    function setSessionUI(session) {
        const el = document.getElementById('session-username');
        const rl = document.getElementById('session-role');
        if (el) el.textContent = session.username;
        if (rl) rl.textContent = Store.getRolLabel(session.role);
    }

    function showToast(msg, type = 'success') {
        const t = document.getElementById('toast-msg');
        if (!t) return;
        t.querySelector('.toast-body').textContent = msg;
        t.className = `toast align-items-center text-white bg-${type} border-0 show`;
        setTimeout(() => t.classList.remove('show'), 3500);
    }
});