package com.example.TongGo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MidtransCallbackDTO {
    
    @JsonProperty("transaction_time")
    private String transactionTime;
    
    @JsonProperty("transaction_status")
    private String transactionStatus; // settlement, pending, deny, cancel, expire, failure
    
    @JsonProperty("transaction_id")
    private String transactionId;
    
    @JsonProperty("status_message")
    private String statusMessage;
    
    @JsonProperty("status_code")
    private String statusCode;
    
    @JsonProperty("merchant_id")
    private String merchantId;
    
    @JsonProperty("masked_card")
    private String maskedCard;
    
    @JsonProperty("gross_amount")
    private String grossAmount;
    
    @JsonProperty("currency")
    private String currency;
    
    @JsonProperty("order_id")
    private String orderId;
    
    @JsonProperty("payment_type")
    private String paymentType;
    
    @JsonProperty("fraud_status")
    private String fraudStatus;
    
    @JsonProperty("approval_code")
    private String approvalCode;
    
    @JsonProperty("signature_key")
    private String signatureKey;
    
    @JsonProperty("bank")
    private String bank;
    
    @JsonProperty("settlement_time")
    private String settlementTime;
    
    @JsonProperty("eci")
    private String eci;
    
    @JsonProperty("channel_response_code")
    private String channelResponseCode;
    
    @JsonProperty("channel_response_message")
    private String channelResponseMessage;
}
