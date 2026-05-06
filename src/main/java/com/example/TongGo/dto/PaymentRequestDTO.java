package com.example.TongGo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDTO {
    
    private Long orderId;
    
    private Double amount;
    
    private String paymentType; // snap, bank_transfer, credit_card, etc
    
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
}
