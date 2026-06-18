package com.utp.ProyectoIntegrador.service;

import com.utp.ProyectoIntegrador.model.Empleado;
import com.utp.ProyectoIntegrador.model.Horario;
import com.utp.ProyectoIntegrador.repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepo;
    private final EmpleadoService   empleadoService;

    public List<Horario> listarTodos() { return horarioRepo.findAll(); }
    public List<Horario> listarPorEmpleado(Long id) { return horarioRepo.findByEmpleadoId(id); }

    @Transactional
    public Horario agregar(Long empleadoId, String dia, String hora, Horario.TipoHorario tipo) {
        empleadoService.validarReglasLaborales(empleadoId, dia, hora);
        Empleado emp = empleadoService.buscarPorId(empleadoId);
        return horarioRepo.save(Horario.builder().empleado(emp).dia(dia).hora(hora).tipo(tipo).build());
    }

    @Transactional
    public void eliminar(Long id) { horarioRepo.deleteById(id); }
}
