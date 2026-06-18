package com.utp.ProyectoIntegrador.controller;

import com.utp.ProyectoIntegrador.exception.ReglaLaboralException;
import com.utp.ProyectoIntegrador.model.*;
import com.utp.ProyectoIntegrador.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/supervisor")
@RequiredArgsConstructor
public class SupervisorController {

    private final EmpleadoService empSvc;
    private final HorarioService  horSvc;
    private final TicketService   tktSvc;

    private static final String[] DIAS  = {"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"};
    private static final String[] HORAS = {"08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"};

    @GetMapping
    public String dashboard(@RequestParam(required=false) String filtro, Model m) {
        List<Ticket> tickets = resolverFiltro(filtro);
        m.addAttribute("tickets",   tickets);
        m.addAttribute("empleados", empSvc.listarTodos());
        m.addAttribute("horarios",  horSvc.listarTodos());
        m.addAttribute("filtro",    filtro != null ? filtro : "todos");
        m.addAttribute("dias",      DIAS);
        m.addAttribute("horas",     HORAS);
        return "supervisor/dashboard";
    }

    private List<Ticket> resolverFiltro(String filtro) {
        if (filtro == null || filtro.equals("todos")) return tktSvc.listarTodos();
        try { return tktSvc.listarPorRol(Empleado.Rol.valueOf(filtro)); } catch (Exception ignored) {}
        try { return tktSvc.listarPorEstado(Ticket.EstadoTicket.valueOf(filtro)); } catch (Exception ignored) {}
        return tktSvc.listarTodos();
    }

    @PostMapping("/tickets/estado/{id}")
    public String cambiarEstado(@PathVariable Long id,
                                @RequestParam Ticket.EstadoTicket estado,
                                RedirectAttributes ra) {
        tktSvc.cambiarEstado(id, estado);
        ra.addFlashAttribute("success", "Ticket actualizado a \"" + estado.getLabel() + "\".");
        return "redirect:/supervisor";
    }

    @PostMapping("/horarios/agregar")
    public String agregarHorario(@RequestParam Long empleadoId,
                                 @RequestParam String dia,
                                 @RequestParam String hora,
                                 RedirectAttributes ra) {
        try {
            horSvc.agregar(empleadoId, dia, hora, Horario.TipoHorario.fijo);
            ra.addFlashAttribute("success", "Horario fijo agregado.");
        } catch (ReglaLaboralException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/supervisor";
    }

    @PostMapping("/horarios/eliminar/{id}")
    public String eliminarHorario(@PathVariable Long id, RedirectAttributes ra) {
        horSvc.eliminar(id);
        ra.addFlashAttribute("success", "Horario eliminado.");
        return "redirect:/supervisor";
    }
}
