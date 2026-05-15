package com.example.TongGo.controller;

import com.example.TongGo.dto.AuthRequest;
import com.example.TongGo.dto.AuthResponse;
import com.example.TongGo.model.Role;
import com.example.TongGo.model.userModel;
import com.example.TongGo.repository.UserRepository;
import com.example.TongGo.security.CustomUserDetails;
import com.example.TongGo.security.CustomUserDetailsService;
import com.example.TongGo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authenticationRequest) throws Exception {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getEmail(), authenticationRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Email atau password salah");
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authenticationRequest.getEmail());

        final String jwt = jwtUtil.generateToken(userDetails);
        
        userModel user = userRepository.findByEmail(authenticationRequest.getEmail()).get();

        return ResponseEntity.ok(new AuthResponse(jwt, user.getId(), user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody userModel user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email sudah digunakan");
        }
        
        // Enforce USER role for all registrations
        user.setRole(Role.USER);
        
        // Harusnya password di-hash menggunakan BCrypt, untuk demo kita simpan plain
        userRepository.save(user);
        
        return ResponseEntity.ok("User berhasil didaftarkan");
    }
}
