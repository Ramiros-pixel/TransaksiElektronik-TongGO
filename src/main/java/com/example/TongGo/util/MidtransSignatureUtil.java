package com.example.TongGo.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MidtransSignatureUtil {

    @Value("${midtrans.server.key}")
    private String serverKey;

    /**
     * Verify Midtrans callback signature
     * Formula: SHA512(order_id + status_code + gross_amount + server_key)
     */
    public boolean verifySignature(String orderId, String statusCode, String grossAmount, String signature) {
        try {
            String rawString = orderId + statusCode + grossAmount + serverKey;
            String calculatedSignature = generateSignature(rawString);
            
            return calculatedSignature.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Generate SHA512 hash
     */
    public String generateSignature(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-512");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex string
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
}
