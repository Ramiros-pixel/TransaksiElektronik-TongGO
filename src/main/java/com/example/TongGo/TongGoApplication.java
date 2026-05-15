package com.example.TongGo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class TongGoApplication {

	public static void main(String[] args) {
		SpringApplication.run(TongGoApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDatabase(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("Memulai pembersihan data status...");
				// Mengubah status lama (null) menjadi 0 (pending)
				jdbcTemplate.execute("UPDATE orders SET status = 0 WHERE status IS NULL");
				System.out.println("Database berhasil disinkronkan.");
			} catch (Exception e) {
				System.out.println("Catatan: Tabel mungkin belum dibuat, melewati pembersihan.");
			}
		};
	}
}
