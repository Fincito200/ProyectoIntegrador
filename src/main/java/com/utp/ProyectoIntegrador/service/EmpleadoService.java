package com.utp.ProyectoIntegrador.service;

import com.utp.ProyectoIntegrador.exception.ReglaLaboralException;
import com.utp.ProyectoIntegrador.model.Empleado;
import com.utp.ProyectoIntegrador.repository.EmpleadoRepository;
import com.utp.ProyectoIntegrador.repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpleadoService {

    private final EmpleadoRepository empleadoRepo;
    private final HorarioRepository  horarioRepo;

    public List<Empleado> listarTodos() { return empleadoRepo.findAll(); }

    public Empleado buscarPorId(Long id) {
        return empleadoRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empleado no encontrado: " + id));
    }

    @Transactional
    public Empleado guardar(Empleado e) { return empleadoRepo.save(e); }

    @Transactional
    public void eliminar(Long id) { empleadoRepo.deleteById(id); }

    public List<Empleado> listarPorRol(Empleado.Rol rol) { return empleadoRepo.findByRol(rol); }

    public long totalEmpleados() { return empleadoRepo.count(); }
    public long totalFijos()     { return empleadoRepo.countByTipo(Empleado.TipoContrato.fijo); }
    public long totalFlex()      { return empleadoRepo.countByTipo(Empleado.TipoContrato.flexible); }
    public long totalCajeros()   { return empleadoRepo.countByRol(Empleado.Rol.cajero); }

    public void validarReglasLaborales(Long empleadoId, String dia, String hora) {
        Empleado emp = buscarPorId(empleadoId);
        if (horarioRepo.existsByEmpleadoIdAndDiaAndHora(empleadoId, dia, hora))
            throw new ReglaLaboralException(
                "Cruce de horario: " + emp.getNombre() + " ya tiene turno el " + dia + " a las " + hora + ".");
        if (emp.getTipo() == Empleado.TipoContrato.flexible) {
            int horas = horarioRepo.countByEmpleadoId(empleadoId) * 4;
            if ((horas + 4) > emp.getHoras())
                throw new ReglaLaboralException(
                    "Límite excedido: " + emp.getNombre() + " (Part-time) no puede superar " + emp.getHoras() + "h.");
        }
    }
}
