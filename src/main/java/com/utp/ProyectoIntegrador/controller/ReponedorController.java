package com.utp.ProyectoIntegrador.controller;

import com.utp.ProyectoIntegrador.model.*;
import com.utp.ProyectoIntegrador.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/reponedor")
@RequiredArgsConstructor
public class ReponedorController {

    private final EmpleadoService empSvc;
    private final HorarioService  horSvc;
    private final TicketService   tktSvc;
    private static final String[] DIAS  = {"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"};
    private static final String[] HORAS = {"08:00","10:00","14:00","18:00"};

    @GetMapping
    public String dashboard(@AuthenticationPrincipal UserDetails user, Model m) {
        List<Empleado> lista = empSvc.listarPorRol(Empleado.Rol.reponedor);
        Empleado miEmp = lista.isEmpty() ? null : lista.get(0);
        List<Horario> misHors = miEmp != null ? horSvc.listarPorEmpleado(miEmp.getId()) : List.of();
        m.addAttribute("miEmpleado",  miEmp);
        m.addAttribute("misHorarios", misHors);
        m.addAttribute("misTickets",  tktSvc.listarPorRol(Empleado.Rol.reponedor));
        m.addAttribute("totalTurnos", misHors.size());
        m.addAttribute("totalHoras",  misHors.size() * 4);
        m.addAttribute("dias",  DIAS);
        m.addAttribute("horas", HORAS);
        m.addAttribute("username", user.getUsername());
        return "reponedor/dashboard";
    }

    @PostMapping("/tickets/crear")
    public String crearTicket(@AuthenticationPrincipal UserDetails user,
                              @RequestParam String titulo, @RequestParam String categoria,
                              @RequestParam Ticket.Prioridad prioridad, @RequestParam String descripcion,
                              RedirectAttributes ra) {
        tktSvc.crear(Ticket.builder().titulo(titulo).categoria(categoria).prioridad(prioridad)
            .descripcion(descripcion).rol(Empleado.Rol.reponedor).autor(user.getUsername()).build());
        ra.addFlashAttribute("success", "Ticket creado.");
        return "redirect:/reponedor";
    }
}
