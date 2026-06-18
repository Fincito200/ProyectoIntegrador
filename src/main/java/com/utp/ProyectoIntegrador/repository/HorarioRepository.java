package com.utp.ProyectoIntegrador.repository;

import com.utp.ProyectoIntegrador.model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByEmpleadoId(Long empleadoId);
    boolean existsByEmpleadoIdAndDiaAndHora(Long empleadoId, String dia, String hora);
    int countByEmpleadoId(Long empleadoId);
}
