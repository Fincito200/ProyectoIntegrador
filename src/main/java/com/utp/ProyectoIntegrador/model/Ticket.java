package com.utp.ProyectoIntegrador.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 1000)
    private String descripcion;

    private String categoria;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Empleado.Rol rol;

    private String autor;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoTicket estado;

    @PrePersist
    public void prePersist() {
        if (fecha == null) fecha = LocalDateTime.now();
        if (estado == null) estado = EstadoTicket.pendiente;
    }

    public enum EstadoTicket {
        pendiente, proceso, resuelto;
        public String getLabel() {
            return switch (this) {
                case pendiente -> "Pendiente";
                case proceso   -> "En Proceso";
                case resuelto  -> "Resuelto";
            };
        }
    }
    public enum Prioridad { Alta, Media, Baja }
}
