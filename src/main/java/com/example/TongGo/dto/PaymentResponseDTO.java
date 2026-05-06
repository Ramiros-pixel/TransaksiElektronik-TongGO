package com.example.TongGo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    
    private Long paymentId;
    
    private Long orderId;
    
    private String midtransId;
    
    private String redirectUrl;
    
    private String paymentStatus;
    
    private Double amount;
    
    private Boolean success;

    private String message;

    // Manual constructor matching the controller's usage
    public PaymentResponseDTO(Long paymentId, Long orderId, String midtransId, String redirectUrl, String paymentStatus, Double amount, Boolean success, String message) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.midtransId = midtransId;
        this.redirectUrl = redirectUrl;
        this.paymentStatus = paymentStatus;
        this.amount = amount;
        this.success = success;
        this.message = message;
    }

    public static PaymentResponseDTO error(String message) {
        return new PaymentResponseDTO(null, null, null, null, null, null, false, message);
    }
}
