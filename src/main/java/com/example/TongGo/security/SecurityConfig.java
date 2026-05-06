package com.example.TongGo.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService myUserDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    // Untuk demo sederhana, kita menggunakan NoOp (plain text). 
    // Di aplikasi produksi WAJIB menggunakan BCryptPasswordEncoder.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance(); 
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(myUserDetailsService)
                .passwordEncoder(passwordEncoder())
                .and()
                .build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
                // Endpoint ini bebas diakses tanpa token
                .authorizeHttpRequests().requestMatchers("/api/auth/**", "/api/payment/callback").permitAll()
                // Role-based access contoh:
                // .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Semua request lain WAJIB memiliki token JWT
                .anyRequest().authenticated()
                .and()
                // Matikan session karena kita pakai JWT (stateless)
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        // Tambahkan filter JWT sebelum UsernamePasswordAuthenticationFilter standar Spring
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
