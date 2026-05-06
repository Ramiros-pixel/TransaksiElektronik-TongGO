package com.example.TongGo.controller;

import com.example.TongGo.dto.MidtransCallbackDTO;
import com.example.TongGo.dto.PaymentRequestDTO;
import com.example.TongGo.dto.PaymentResponseDTO;
import com.example.TongGo.service.PaymentService;
import com.example.TongGo.util.MidtransSignatureUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private MidtransSignatureUtil signatureUtil;

    /**
     * Create payment transaction
     * POST /api/payment/process
     */
    @PostMapping("/process")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequestDTO request) {
        try {
            if (request.getOrderId() == null || request.getAmount() == null) {
                return ResponseEntity.badRequest()
                        .body(PaymentResponseDTO.error("Order ID and Amount are required"));
            }

            PaymentResponseDTO response = paymentService.createTransaction(request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(PaymentResponseDTO.error("Error: " + e.getMessage()));
        }
    }

    /**
     * Handle Midtrans callback/notification
     * POST /api/payment/callback
     */
    @PostMapping("/callback")
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
            // Still return 200 OK but log the error
            System.err.println("Error processing callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("status", "error");
                put("message", e.getMessage());
            }});
        }
    }

    /**
     * Get payment status by order ID
     * GET /api/payment/{orderId}
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long orderId) {
        try {
            PaymentResponseDTO response = paymentService.getPaymentStatus(orderId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(PaymentResponseDTO.error("Payment not found for order ID: " + orderId));
        }
    }

    /**
     * Get payment status by Midtrans ID
     * GET /api/payment/midtrans/{midtransId}
     */
    @GetMapping("/midtrans/{midtransId}")
    public ResponseEntity<?> getPaymentByMidtransId(@PathVariable String midtransId) {
        try {
            // This endpoint can be extended to check payment status directly from Midtrans
            return ResponseEntity.ok(new HashMap<String, String>() {{
                put("status", "ok");
                put("message", "Use order ID endpoint instead");
            }});

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new HashMap<String, String>() {{
                        put("status", "error");
                        put("message", e.getMessage());
                    }});
        }
    }

    /**
     * Health check endpoint
     * GET /api/payment/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(new HashMap<String, String>() {{
            put("status", "ok");
            put("message", "Payment service is running");
        }});
    }
}
