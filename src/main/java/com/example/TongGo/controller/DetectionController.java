package com.example.TongGo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RestController
@RequestMapping("/api/detection")
@CrossOrigin(origins = "*")
public class DetectionController {

    private final String scriptPath = Paths.get("deteksi", "main.py").toAbsolutePath().toString();
    private final String resultImagePath = Paths.get("hasil_scan.jpg").toAbsolutePath().toString();
    private final String resultPdfPath = Paths.get("hasil_deteksi.pdf").toAbsolutePath().toString();

    @PostMapping("/start")
    public ResponseEntity<?> startDetection() {
        try {
            ProcessBuilder pb = new ProcessBuilder("python", scriptPath);
            pb.redirectErrorStream(true);
            pb.start();
            return ResponseEntity.ok(Map.of("message", "Sistem deteksi kamera dibuka. Silakan cek jendela aplikasi 'Deteksi Uang'."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Gagal menjalankan deteksi: " + e.getMessage());
        }
    }

    @GetMapping("/latest-scan")
    public ResponseEntity<byte[]> getLatestScan() {
        try {
            Path path = Paths.get(resultImagePath);
            if (Files.exists(path)) {
                byte[] image = Files.readAllBytes(path);
                return ResponseEntity.ok().header("Content-Type", "image/jpeg").body(image);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/latest-pdf")
    public ResponseEntity<byte[]> getLatestPdf() {
        try {
            Path path = Paths.get(resultPdfPath);
            if (Files.exists(path)) {
                byte[] pdf = Files.readAllBytes(path);
                return ResponseEntity.ok()
                        .header("Content-Type", "application/pdf")
                        .header("Content-Disposition", "attachment; filename=\"hasil_deteksi.pdf\"")
                        .body(pdf);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
