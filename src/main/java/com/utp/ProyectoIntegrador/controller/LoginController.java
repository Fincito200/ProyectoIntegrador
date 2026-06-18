package com.utp.ProyectoIntegrador.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {
    @GetMapping("/login")
    public String login(@RequestParam(required=false) String error,
                        @RequestParam(required=false) String logout, Model m) {
        if (error  != null) m.addAttribute("error",  "Credenciales incorrectas.");
        if (logout != null) m.addAttribute("logout", "Sesión cerrada correctamente.");
        return "login";
    }
    @GetMapping("/")
    public String root() { return "redirect:/login"; }
}
