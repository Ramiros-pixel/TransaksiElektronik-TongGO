package com.example.TongGo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import java.time.LocalDateTime;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "payments")
@Data
public class paymentModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPayment;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private orderModel orderId;

    @Column(name = "midtrans_id", nullable = false)
    private String midtransId;

    @Column(name = "transaction_id", nullable = true)
    private String transactionId;

    @Column(name = "payment_type", nullable = false)
    private String paymentType;

    @Column(name = "payment_method", nullable = true)
    private String paymentMethod; // credit_card, transfer, e_wallet, etc

    @Column(name = "gross_amount", nullable = false)
    private Double grossAmount;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus = "pending"; // pending, settlement, expire, cancel, failed

    @Column(name = "redirect_url", nullable = true)
    private String redirectUrl;

    @Column(name = "signature_key", nullable = true)
    private String signatureKey;

    @Column(name = "payment_time", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;
}
