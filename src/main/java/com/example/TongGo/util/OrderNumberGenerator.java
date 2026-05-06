package com.example.TongGo.util;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.time.Instant;

@Component
public class OrderNumberGenerator {

    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int RANDOM_LENGTH = 6;

    /**
     * Generate unique order number
     * Format: ORD-{TIMESTAMP}-{RANDOM}
     * Example: ORD-1715000000123-ABC123
     */
    public String generateOrderNumber() {
        long timestamp = Instant.now().toEpochMilli();
        String randomPart = generateRandomString(RANDOM_LENGTH);
        
        return "ORD-" + timestamp + "-" + randomPart;
    }

    /**
     * Generate random string for order number
     */
    private String generateRandomString(int length) {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        
        return sb.toString();
    }
}
