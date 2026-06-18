package com.utp.ProyectoIntegrador.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "empleados")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Empleado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoContrato tipo;

    @Column(nullable = false)
    private int horas;

    @OneToMany(mappedBy = "empleado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Horario> horarios;

    public enum Rol {
        cajero, reponedor, supervisor, limpieza, admin;
        public String getLabel() {
            return switch (this) {
                case cajero -> "Cajero";
                case reponedor -> "Reponedor";
                case supervisor -> "Supervisor";
                case limpieza -> "Limpieza";
                case admin -> "Admin";
            };
        }
        public String getBadgeColor() {
            return switch (this) {
                case cajero -> "primary";
                case reponedor -> "success";
                case supervisor -> "warning";
                case limpieza -> "purple";
                case admin -> "danger";
            };
        }
    }

    public enum TipoContrato {
        fijo, flexible;
        public String getLabel() {
            return this == fijo ? "Fijo" : "Flexible";
        }
    }
}
