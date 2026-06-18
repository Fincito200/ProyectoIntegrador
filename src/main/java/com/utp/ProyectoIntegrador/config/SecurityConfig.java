package com.utp.ProyectoIntegrador.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder enc) {
        return new InMemoryUserDetailsManager(
            user("supervisor", "1234",  "SUPERVISOR", enc),
            user("cajero",     "1234",  "CAJERO",     enc),
            user("reponedor",  "1234",  "REPONEDOR",  enc),
            user("limpieza",   "1234",  "LIMPIEZA",   enc),
            user("admin",      "admin", "ADMIN",      enc)
        );
    }

    private UserDetails user(String u, String p, String role, PasswordEncoder enc) {
        return User.builder().username(u).password(enc.encode(p)).roles(role).build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(a -> a
                .requestMatchers("/css/**","/js/**","/h2-console/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/supervisor/**").hasRole("SUPERVISOR")
                .requestMatchers("/cajero/**").hasRole("CAJERO")
                .requestMatchers("/reponedor/**").hasRole("REPONEDOR")
                .requestMatchers("/limpieza/**").hasRole("LIMPIEZA")
                .anyRequest().authenticated()
            )
            .formLogin(f -> f
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .successHandler(new RoleBasedSuccessHandler())
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(l -> l.logoutUrl("/logout").logoutSuccessUrl("/login?logout=true").permitAll())
            .csrf(c -> c.ignoringRequestMatchers("/h2-console/**"))
            .headers(h -> h.frameOptions(f -> f.sameOrigin()));
        return http.build();
    }
}
