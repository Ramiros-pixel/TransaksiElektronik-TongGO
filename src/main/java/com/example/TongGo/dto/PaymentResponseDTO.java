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

    public static PaymentResponseDTO error(String message) {
        return new PaymentResponseDTO(null, null, null, null, null, null, false, message);
    }
}
