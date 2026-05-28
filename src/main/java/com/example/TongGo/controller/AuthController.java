package com.example.TongGo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.TongGo.dto.AuthRequest;
import com.example.TongGo.dto.AuthResponse;
import com.example.TongGo.model.Role;
import com.example.TongGo.model.userModel;
import com.example.TongGo.repository.UserRepository;
import com.example.TongGo.security.CustomUserDetailsService;
import com.example.TongGo.security.JwtUtil;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired(required = false)
    private JavaMailSender mailSender;

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
        
        // Enforce ADMIN role for all registrations as per original code
        user.setRole(Role.ADMIN);
        
        // Hash password menggunakan BCrypt
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok("User berhasil didaftarkan");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<userModel> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Email tidak terdaftar");
        }

        userModel user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Kirim email
        String resetLink = "http://localhost:5173/admin-login?token=" + token + "&mode=reset";
        String emailContent = "Halo " + user.getUsername() + ",\n\n"
                + "Anda telah meminta untuk mereset password Anda. Silakan klik link di bawah ini untuk mereset password Anda:\n"
                + resetLink + "\n\n"
                + "Token reset Anda adalah: " + token + "\n\n"
                + "Link ini akan kedaluwarsa dalam 15 menit.\n\n"
                + "Terima kasih,\nTim TongGo";

        try {
            if (mailSender == null) {
                throw new IllegalStateException("MailSender belum dikonfigurasi.");
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Reset Password - TongGo");
            message.setText(emailContent);
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("message", "Link reset password telah dikirim ke email Anda."));
        } catch (Exception e) {
            System.err.println("Gagal mengirim email reset password: " + e.getMessage());
            // Fallback agar developer bisa menggunakan token langsung
            return ResponseEntity.ok(Map.of(
                "message", "Permintaan berhasil dibuat, namun gagal mengirim email (SMTP belum dikonfigurasi).",
                "token", token
            ));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Token tidak valid");
        }

        Optional<userModel> userOpt = userRepository.findByResetPasswordToken(token);
        if (!userOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Token tidak valid atau salah");
        }

        userModel user = userOpt.get();
        if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token reset password telah kedaluwarsa");
        }

        // Hash password baru dengan BCrypt
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password berhasil diubah. Silakan login dengan password baru Anda."));
    }
}
