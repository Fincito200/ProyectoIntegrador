/**
 * Store.js — Estado compartido de la app (Prototipo Frontend sin Backend)
 * Usar sessionStorage para persistir entre páginas de la misma sesión
 */
class Store {
    static EMPLOYEES_KEY = 'timeforge_employees';
    static SCHEDULES_KEY = 'timeforge_schedules';

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

    static saveEmployees(employees) {
        sessionStorage.setItem(this.EMPLOYEES_KEY, JSON.stringify(employees));
    }

    static addEmployee(emp) {
        const employees = this.getEmployees();
        const newEmp = { ...emp, id: Date.now() };
        employees.push(newEmp);
        this.saveEmployees(employees);
        return newEmp;
    }

    static deleteEmployee(id) {
        const employees = this.getEmployees().filter(e => e.id !== id);
        this.saveEmployees(employees);
    }

    /* ─── MOTOR DE REGLAS LABORALES ─────────────────── */
    static validarReglasLaborales(empleadoId, dia, hora) {
        const schedules = this.getSchedules();
        const employees = this.getEmployees();
        const empleado = employees.find(e => e.id === empleadoId);

        if (!empleado) return { valido: false, mensaje: 'Empleado no encontrado.' };

        // REGLA 1: Evitar cruce de horarios
        const cruce = schedules.find(s => s.empleadoId === empleadoId && s.dia === dia && s.hora === hora);
        if (cruce) return { valido: false, mensaje: `Cruce de horario: ${empleado.nombre} ya tiene turno el ${dia} a las ${hora}.` };

        // REGLA 2: Límite de horas semanales (Asumiendo que cada bloque son 4 horas)
        const turnosAsignados = schedules.filter(s => s.empleadoId === empleadoId).length;
        const horasActuales = turnosAsignados * 4;
        const nuevoTotal = horasActuales + 4;

        if (empleado.tipo === 'flexible' && nuevoTotal > empleado.horas) {
            return { valido: false, mensaje: `Límite excedido: ${empleado.nombre} (Part-time) no puede superar ${empleado.horas}h.` };
        }
        
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

    static saveSchedules(schedules) {
        sessionStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules));
    }

    static addSchedule(schedule) {
        // Ejecutamos el motor de reglas antes de guardar
        const validacion = this.validarReglasLaborales(schedule.empleadoId, schedule.dia, schedule.hora);
        
        if (!validacion.valido) {
            throw new Error(validacion.mensaje); // Lanza el error para que la UI lo atrape
        }

        const schedules = this.getSchedules();
        const newSch = { ...schedule, id: Date.now() };
        schedules.push(newSch);
        this.saveSchedules(schedules);
        return newSch;
    }

    static deleteSchedule(id) {
        const schedules = this.getSchedules().filter(s => s.id !== id);
        this.saveSchedules(schedules);
    }

    /* ─── HELPERS ───────────────────────────────────── */
    static getRolColor(rol) {
        const map = { cajero: 'primary', reponedor: 'success', supervisor: 'warning', limpieza: 'purple', admin: 'danger' };
        return map[rol] || 'secondary';
    }

    static getRolLabel(rol) {
        const map = { cajero: 'Cajero', reponedor: 'Reponedor', supervisor: 'Supervisor', limpieza: 'Limpieza', admin: 'Admin' };
        return map[rol] || rol;
    }

    static getHomeByRole(role) {
        const map = { admin: 'admin.html', supervisor: 'supervisor.html', cajero: 'cajero.html', reponedor: 'reponedor.html', limpieza: 'limpieza.html' };
        return map[role] || 'login.html';
    }
}