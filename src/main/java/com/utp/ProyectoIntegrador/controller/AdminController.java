package com.utp.ProyectoIntegrador.controller;

import com.utp.ProyectoIntegrador.exception.ReglaLaboralException;
import com.utp.ProyectoIntegrador.model.*;
import com.utp.ProyectoIntegrador.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final EmpleadoService empSvc;
    private final HorarioService  horSvc;

    private static final String[] DIAS  = {"Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"};
    private static final String[] HORAS = {"08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"};

    @GetMapping
    public String dashboard(Model m) {
        m.addAttribute("empleados",      empSvc.listarTodos());
        m.addAttribute("horarios",       horSvc.listarTodos());
        m.addAttribute("totalEmpleados", empSvc.totalEmpleados());
        m.addAttribute("totalFijos",     empSvc.totalFijos());
        m.addAttribute("totalFlex",      empSvc.totalFlex());
        m.addAttribute("totalCajeros",   empSvc.totalCajeros());
        m.addAttribute("roles",          Empleado.Rol.values());
        m.addAttribute("tipos",          Empleado.TipoContrato.values());
        m.addAttribute("dias",           DIAS);
        m.addAttribute("horas",          HORAS);
        return "admin/dashboard";
    }

    @PostMapping("/empleados/agregar")
    public String agregarEmpleado(@RequestParam String nombre,
                                  @RequestParam Empleado.Rol rol,
                                  @RequestParam Empleado.TipoContrato tipo,
                                  @RequestParam int horas,
                                  RedirectAttributes ra) {
        empSvc.guardar(Empleado.builder().nombre(nombre).rol(rol).tipo(tipo).horas(horas).build());
        ra.addFlashAttribute("success", "Empleado \"" + nombre + "\" agregado.");
        return "redirect:/admin";
    }

    @PostMapping("/empleados/eliminar/{id}")
    public String eliminarEmpleado(@PathVariable Long id, RedirectAttributes ra) {
        empSvc.eliminar(id);
        ra.addFlashAttribute("success", "Empleado eliminado.");
        return "redirect:/admin";
    }

    @PostMapping("/horarios/agregar")
    public String agregarHorario(@RequestParam Long empleadoId,
                                 @RequestParam String dia,
                                 @RequestParam String hora,
                                 RedirectAttributes ra) {
        try {
            horSvc.agregar(empleadoId, dia, hora, Horario.TipoHorario.fijo);
            ra.addFlashAttribute("success", "Horario registrado.");
        } catch (ReglaLaboralException ex) {
            ra.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/admin";
    }

    @PostMapping("/horarios/eliminar/{id}")
    public String eliminarHorario(@PathVariable Long id, RedirectAttributes ra) {
        horSvc.eliminar(id);
        ra.addFlashAttribute("success", "Horario eliminado.");
        return "redirect:/admin";
    }
}
