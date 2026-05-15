/**
 * supervisor.js — Panel de Supervisor (Prototipo Frontend)
 * Depende de: Auth.js, Store.js
 */
document.addEventListener('DOMContentLoaded', () => {

    Auth.requireRole('supervisor');

    const session = Auth.getSession();
    setSessionUI(session);

    document.getElementById('btn-logout').addEventListener('click', () => Auth.logout());

    const wrapper = document.getElementById('wrapper');
    document.getElementById('menu-toggle').addEventListener('click', () => wrapper.classList.toggle('toggled'));

    initNav();
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
            showToast(error.message, 'danger'); // Alerta del Motor de Reglas
        }
    });

    /* ── RENDER CALENDARIO (7 días x 4 franjas) ── */
    function renderCalendario() {
        const DIAS   = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
        const HORAS  = ['08:00','10:00','14:00','18:00'];
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
                    const label = emp ? emp.nombre : '?';
                    td.innerHTML = `
                        <div class="turno-fijo p-2 rounded text-white shadow-sm d-flex align-items-center justify-content-between">
                            <span><i class="fa-solid fa-lock small me-1"></i>${label}</span>
                            <span class="remove-sch" data-id="${sch.id}" title="Quitar" style="cursor:pointer;opacity:0.7;font-size:0.75rem;">✕</span>
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

    /* ── PANEL LATERAL EMPLEADOS ── */
    function renderEmpleadosLateral() {
        const employees = Store.getEmployees();
        const fijos = employees.filter(e => e.tipo === 'fijo');
        const flex  = employees.filter(e => e.tipo === 'flexible');

        const listFijos = document.getElementById('list-fijos');
        listFijos.innerHTML = fijos.map(e => `
            <div class="list-group-item p-2 small">
                <i class="fa-regular fa-user me-1"></i> ${e.nombre}
                <span class="badge bg-${Store.getRolColor(e.rol)} ms-1" style="font-size:0.65rem;">${Store.getRolLabel(e.rol)}</span>
            </div>`).join('');

        const listFlex = document.getElementById('list-flex');
        listFlex.innerHTML = flex.map(e => `
            <div class="list-group-item p-2 small border-start border-success border-4 empleado-drag cursor-grab"
                 data-nombre="${e.nombre}" data-id="${e.id}" draggable="true">
                <i class="fa-solid fa-grip-vertical text-muted me-2"></i>${e.nombre}
                <span class="badge bg-${Store.getRolColor(e.rol)} ms-1" style="font-size:0.65rem;">${Store.getRolLabel(e.rol)}</span>
            </div>`).join('');
    }

    /* ── DRAG & DROP CON MOTOR DE REGLAS ── */
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
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!zone.querySelector('.turno-flexible')) zone.classList.add('drop-hover');
            });
            zone.addEventListener('dragleave', () => zone.classList.remove('drop-hover'));
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drop-hover');
                if (zone.querySelector('.turno-flexible')) return;

                try {
                    // Intenta guardar. Si viola una regla, Store.addSchedule lanzará un error.
                    const nuevoTurno = Store.addSchedule({ empleadoId: draggedId, dia: zone.dataset.dia, hora: zone.dataset.hora, tipo: 'flexible' });

                    // Si no hubo error, dibuja el bloque en la interfaz
                    const turno = document.createElement('div');
                    turno.className = 'turno-flexible p-2 rounded text-white shadow-sm d-flex align-items-center justify-content-between';
                    turno.innerHTML = `
                        <span><i class="fa-solid fa-grip-vertical small me-1"></i>${draggedName}</span>
                        <span class="remove-turno" data-id="${nuevoTurno.id}" title="Quitar" style="cursor:pointer;opacity:0.7;font-size:0.75rem;">✕</span>`;
                    zone.appendChild(turno);
                    zone.classList.remove('drop-zone', 'bg-light');

                    turno.querySelector('.remove-turno').addEventListener('click', function() {
                        Store.deleteSchedule(parseInt(this.dataset.id));
                        turno.remove();
                        zone.classList.add('drop-zone', 'bg-light');
                    });
                    
                    showToast('Turno flexible asignado correctamente.', 'success');

                } catch (error) {
                    // EL MOTOR DE REGLAS DETECTÓ UN ERROR (Cruce u Horas límite)
                    showToast(error.message, 'danger');
                }
            });
        });
    }

    /* Funciones UI básicas */
    function initNav() {
        const navLinks    = document.querySelectorAll('#sidebar-wrapper .list-group-item');
        const sections    = document.querySelectorAll('.view-section');
        const tituloVista = document.getElementById('vista-titulo');
        const titulos = {
            'sec-dashboard': 'Dashboard de Cobertura',
            'sec-horarios':  'Constructor de Horarios',
            'sec-agregar':   'Agregar Horario Fijo',
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
        setTimeout(() => t.classList.remove('show'), 3500); // Se oculta automáticamente después de 3.5s
    }
});