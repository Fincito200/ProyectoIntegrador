package com.utp.ProyectoIntegrador.config;

import com.utp.ProyectoIntegrador.model.*;
import com.utp.ProyectoIntegrador.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final EmpleadoRepository empRepo;
    private final HorarioRepository  horRepo;
    private final TicketRepository   tktRepo;

    @Override
    public void run(String... args) {
        Empleado e1 = emp("María García",   Empleado.Rol.cajero,     Empleado.TipoContrato.fijo,     48);
        Empleado e2 = emp("Juan Pérez",     Empleado.Rol.reponedor,  Empleado.TipoContrato.fijo,     48);
        Empleado e3 = emp("Ana García",     Empleado.Rol.supervisor, Empleado.TipoContrato.fijo,     48);
        Empleado e4 = emp("Laura Martín",   Empleado.Rol.cajero,     Empleado.TipoContrato.flexible, 24);
        Empleado e5 = emp("Pedro Sánchez",  Empleado.Rol.reponedor,  Empleado.TipoContrato.flexible, 24);
        Empleado e6 = emp("Sofía Torres",   Empleado.Rol.cajero,     Empleado.TipoContrato.flexible, 24);
        Empleado e7 = emp("Carlos Ruiz",    Empleado.Rol.limpieza,   Empleado.TipoContrato.fijo,     48);
        Empleado e8 = emp("Rosa Mendoza",   Empleado.Rol.limpieza,   Empleado.TipoContrato.flexible, 24);
        List<Empleado> saved = empRepo.saveAll(List.of(e1,e2,e3,e4,e5,e6,e7,e8));
        e1=saved.get(0); e2=saved.get(1); e3=saved.get(2);

        horRepo.saveAll(List.of(
            hor(e1,"Lunes","08:00"), hor(e1,"Martes","08:00"),
            hor(e2,"Lunes","14:00"), hor(e3,"Miércoles","08:00")
        ));

        tktRepo.saveAll(List.of(
            tkt("Caja 3 no imprime","La impresora de la caja 3 no funciona desde esta mañana.",
                "Equipo", Ticket.Prioridad.Alta, Empleado.Rol.cajero,"cajero", Ticket.EstadoTicket.pendiente),
            tkt("Falta de producto en góndola","Sección bebidas sin stock desde ayer.",
                "Reposición", Ticket.Prioridad.Media, Empleado.Rol.reponedor,"reponedor", Ticket.EstadoTicket.proceso),
            tkt("Derrame en pasillo 4","Hay un derrame de líquido que necesita atención inmediata.",
                "Urgencia", Ticket.Prioridad.Alta, Empleado.Rol.limpieza,"limpieza", Ticket.EstadoTicket.pendiente)
        ));
    }

    private Empleado emp(String n, Empleado.Rol r, Empleado.TipoContrato t, int h) {
        return Empleado.builder().nombre(n).rol(r).tipo(t).horas(h).build();
    }
    private Horario hor(Empleado e, String d, String h) {
        return Horario.builder().empleado(e).dia(d).hora(h).tipo(Horario.TipoHorario.fijo).build();
    }
    private Ticket tkt(String ti, String de, String ca, Ticket.Prioridad pr,
                       Empleado.Rol ro, String au, Ticket.EstadoTicket es) {
        return Ticket.builder().titulo(ti).descripcion(de).categoria(ca).prioridad(pr)
               .rol(ro).autor(au).estado(es).fecha(LocalDateTime.now()).build();
    }
}
