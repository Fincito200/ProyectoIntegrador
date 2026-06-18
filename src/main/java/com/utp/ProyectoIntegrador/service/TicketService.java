package com.utp.ProyectoIntegrador.service;

import com.utp.ProyectoIntegrador.model.Empleado;
import com.utp.ProyectoIntegrador.model.Ticket;
import com.utp.ProyectoIntegrador.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepo;

    public List<Ticket> listarTodos() { return ticketRepo.findAllByOrderByFechaDesc(); }
    public List<Ticket> listarPorRol(Empleado.Rol rol) { return ticketRepo.findByRolOrderByFechaDesc(rol); }
    public List<Ticket> listarPorEstado(Ticket.EstadoTicket estado) { return ticketRepo.findByEstado(estado); }

    public Ticket buscarPorId(Long id) {
        return ticketRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado: " + id));
    }

    @Transactional
    public Ticket crear(Ticket t) { return ticketRepo.save(t); }

    @Transactional
    public void cambiarEstado(Long id, Ticket.EstadoTicket estado) {
        Ticket t = buscarPorId(id);
        t.setEstado(estado);
        ticketRepo.save(t);
    }

    @Transactional
    public void eliminar(Long id) { ticketRepo.deleteById(id); }
}
