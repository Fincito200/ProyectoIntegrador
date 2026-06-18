package com.utp.ProyectoIntegrador.repository;

import com.utp.ProyectoIntegrador.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    List<Empleado> findByRol(Empleado.Rol rol);
    long countByTipo(Empleado.TipoContrato tipo);
    long countByRol(Empleado.Rol rol);
}
