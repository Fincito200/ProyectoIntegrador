class Store {
    static EMPLOYEES_KEY = 'timeforge_employees';
    static SCHEDULES_KEY = 'timeforge_schedules';
    static TICKETS_KEY   = 'timeforge_tickets';

    /* ─── EMPLEADOS ─────────────────────────────────── */
    static getEmployees() {
        const raw = sessionStorage.getItem(this.EMPLOYEES_KEY);
        if (raw) return JSON.parse(raw);
        const demo = [
            { id: 1, nombre: 'María García',  rol: 'cajero',     tipo: 'fijo',     horas: 48 },
            { id: 2, nombre: 'Juan Pérez',    rol: 'reponedor',  tipo: 'fijo',     horas: 48 },
            { id: 3, nombre: 'Ana García',    rol: 'supervisor', tipo: 'fijo',     horas: 48 },
            { id: 4, nombre: 'Laura Martín',  rol: 'cajero',     tipo: 'flexible', horas: 24 },
            { id: 5, nombre: 'Pedro Sánchez', rol: 'reponedor',  tipo: 'flexible', horas: 24 },
            { id: 6, nombre: 'Sofía Torres',  rol: 'cajero',     tipo: 'flexible', horas: 24 },
            { id: 7, nombre: 'Carlos Ruiz',   rol: 'limpieza',   tipo: 'fijo',     horas: 48 },
            { id: 8, nombre: 'Rosa Mendoza',  rol: 'limpieza',   tipo: 'flexible', horas: 24 },
        ];
        this.saveEmployees(demo);
        return demo;
    }
    static saveEmployees(employees) { sessionStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees)); }
    static addEmployee(emp) {
        const employees = this.getEmployees();
        const newEmp = { ...emp, id: Date.now() };
        employees.push(newEmp);
        this.saveEmployees(employees);
        return newEmp;
    }
    static deleteEmployee(id) {
        this.saveEmployees(this.getEmployees().filter(e => e.id !== id));
    }

    /* ─── MOTOR DE REGLAS LABORALES ─────────────────── */
    static validarReglasLaborales(empleadoId, dia, hora) {
        const schedules = this.getSchedules();
        const employees = this.getEmployees();
        const empleado  = employees.find(e => e.id === empleadoId);
        if (!empleado) return { valido: false, mensaje: 'Empleado no encontrado.' };
        const cruce = schedules.find(s => s.empleadoId === empleadoId && s.dia === dia && s.hora === hora);
        if (cruce) return { valido: false, mensaje: `Cruce de horario: ${empleado.nombre} ya tiene turno el ${dia} a las ${hora}.` };
        const turnosAsignados = schedules.filter(s => s.empleadoId === empleadoId).length;
        const horasActuales = turnosAsignados * 4;
        if (empleado.tipo === 'flexible' && (horasActuales + 4) > empleado.horas)
            return { valido: false, mensaje: `Límite excedido: ${empleado.nombre} (Part-time) no puede superar ${empleado.horas}h.` };
        return { valido: true };
    }

    /* ─── HORARIOS ──────────────────────────────────── */
    static getSchedules() {
        const raw = sessionStorage.getItem(this.SCHEDULES_KEY);
        if (raw) return JSON.parse(raw);
        const demo = [
            { id: 1, empleadoId: 1, dia: 'Lunes',     hora: '08:00', tipo: 'fijo' },
            { id: 2, empleadoId: 1, dia: 'Martes',    hora: '08:00', tipo: 'fijo' },
            { id: 3, empleadoId: 2, dia: 'Lunes',     hora: '14:00', tipo: 'fijo' },
            { id: 4, empleadoId: 3, dia: 'Miércoles', hora: '08:00', tipo: 'fijo' }
        ];
        this.saveSchedules(demo);
        return demo;
    }
    static saveSchedules(schedules) { sessionStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules)); }
    static addSchedule(schedule) {
        const validacion = this.validarReglasLaborales(schedule.empleadoId, schedule.dia, schedule.hora);
        if (!validacion.valido) throw new Error(validacion.mensaje);
        const schedules = this.getSchedules();
        const newSch = { ...schedule, id: Date.now() };
        schedules.push(newSch);
        this.saveSchedules(schedules);
        return newSch;
    }
    static deleteSchedule(id) { this.saveSchedules(this.getSchedules().filter(s => s.id !== id)); }

    /* ─── TICKETS ───────────────────────────────────── */
    /**
     * Ticket: { id, titulo, descripcion, categoria, prioridad,
     *           rol, autor, fecha, estado: 'pendiente'|'proceso'|'resuelto' }
     * rol = rol del colaborador que creó el ticket (cajero/reponedor/limpieza)
     * El supervisor ve solo los tickets de su área (según su propio rol de supervisor)
     * En este prototipo todos los supervisores ven todos los tickets; 
     * si quieres filtrar por área, usa ticket.rol.
     */
    static getTickets() {
        const raw = sessionStorage.getItem(this.TICKETS_KEY);
        if (raw) return JSON.parse(raw);
        // Demo tickets
        const demo = [
            { id: 1, titulo: 'Caja 3 no imprime', descripcion: 'La impresora de la caja 3 no funciona desde esta mañana.', categoria: 'Equipo', prioridad: 'Alta', rol: 'cajero', autor: 'cajero', fecha: new Date().toISOString(), estado: 'pendiente' },
            { id: 2, titulo: 'Falta de producto en góndola', descripcion: 'Sección bebidas sin stock desde ayer.', categoria: 'Reposición', prioridad: 'Media', rol: 'reponedor', autor: 'reponedor', fecha: new Date().toISOString(), estado: 'proceso' },
            { id: 3, titulo: 'Derrame en pasillo 4', descripcion: 'Hay un derrame de líquido que necesita atención inmediata.', categoria: 'Urgencia', prioridad: 'Alta', rol: 'limpieza', autor: 'limpieza', fecha: new Date().toISOString(), estado: 'pendiente' },
        ];
        this.saveTickets(demo);
        return demo;
    }
    static saveTickets(tickets) { sessionStorage.setItem(this.TICKETS_KEY, JSON.stringify(tickets)); }
    static addTicket(ticket) {
        const tickets = this.getTickets();
        const newT = { ...ticket, id: Date.now(), fecha: new Date().toISOString(), estado: 'pendiente' };
        tickets.unshift(newT);
        this.saveTickets(tickets);
        return newT;
    }
    static updateTicketEstado(id, estado) {
        const tickets = this.getTickets().map(t => t.id === id ? { ...t, estado } : t);
        this.saveTickets(tickets);
    }
    static deleteTicket(id) { this.saveTickets(this.getTickets().filter(t => t.id !== id)); }

    /* ─── HELPERS ───────────────────────────────────── */
    static getRolColor(rol) {
        const map = { cajero: 'primary', reponedor: 'success', supervisor: 'warning', limpieza: 'purple', admin: 'danger' };
        return map[rol] || 'secondary';
    }
    static getRolLabel(rol) {
        const map = { cajero: 'Cajero', reponedor: 'Reponedor', supervisor: 'Supervisor', limpieza: 'Limpieza', admin: 'Admin', fijo: 'Fijo', flexible: 'Flexible' };
        return map[rol] || rol;
    }
    static getHomeByRole(role) {
        const map = { admin: 'admin.html', supervisor: 'supervisor.html', cajero: 'cajero.html', reponedor: 'reponedor.html', limpieza: 'limpieza.html' };
        return map[role] || 'login.html';
    }
}