package com.utp.ProyectoIntegrador.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "horarios",
       uniqueConstraints = @UniqueConstraint(columnNames = {"empleado_id","dia","hora"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empleado_id", nullable = false)
    private Empleado empleado;

    @Column(nullable = false)
    private String dia;

    @Column(nullable = false)
    private String hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoHorario tipo;

    public enum TipoHorario { fijo, flexible }
}
