package com.utp.ProyectoIntegrador.repository;

import com.utp.ProyectoIntegrador.model.Empleado;
import com.utp.ProyectoIntegrador.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRolOrderByFechaDesc(Empleado.Rol rol);
    List<Ticket> findByEstado(Ticket.EstadoTicket estado);
    List<Ticket> findAllByOrderByFechaDesc();
}
