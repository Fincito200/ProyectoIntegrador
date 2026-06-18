package com.utp.ProyectoIntegrador.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import java.io.IOException;

public class RoleBasedSuccessHandler implements AuthenticationSuccessHandler {
    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                        Authentication auth) throws IOException {
        String url = "/login";
        for (GrantedAuthority a : auth.getAuthorities()) {
            url = switch (a.getAuthority()) {
                case "ROLE_ADMIN"      -> "/admin";
                case "ROLE_SUPERVISOR" -> "/supervisor";
                case "ROLE_CAJERO"     -> "/cajero";
                case "ROLE_REPONEDOR"  -> "/reponedor";
                case "ROLE_LIMPIEZA"   -> "/limpieza";
                default                -> "/login";
            };
            break;
        }
        res.sendRedirect(url);
    }
}
