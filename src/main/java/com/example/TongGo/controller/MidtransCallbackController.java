package com.example.TongGo.controller;

import com.example.TongGo.dto.MidtransCallbackDTO;
import com.example.TongGo.service.PaymentService;
import com.example.TongGo.util.MidtransSignatureUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = "*")
public class MidtransCallbackController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MidtransSignatureUtil signatureUtil;

    /**
     * Fallback mapping for Midtrans callback
     * Handles both /payment/callback and /api/payment/callback
     */
    @PostMapping({"/payment/callback", "/api/payment/callback"})
    public ResponseEntity<?> handleCallback(@RequestBody MidtransCallbackDTO callback) {
        try {
            // Verify signature
            boolean isValid = signatureUtil.verifySignature(
                    callback.getOrderId(),
                    callback.getStatusCode(),
                    callback.getGrossAmount(),
                    callback.getSignatureKey()
            );

            if (!isValid) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new HashMap<String, String>() {{
                            put("status", "error");
                            put("message", "Invalid signature");
                        }});
            }

            // Process payment notification
            paymentService.handlePaymentNotification(callback);

            // Return 200 OK to acknowledge receipt
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("status", "ok");
                put("message", "Notification received and processed");
            }});

        } catch (Exception e) {
            System.err.println("Error processing callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("status", "error");
                put("message", e.getMessage());
            }});
        }
    }
}
