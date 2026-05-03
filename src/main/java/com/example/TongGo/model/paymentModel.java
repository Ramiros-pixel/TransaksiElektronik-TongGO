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
import lombok.Data;

import java.time.LocalDateTime;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Table(name = "payments")
@Data

public class paymentModel {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long idPayment;

@OneToOne
@JoinColumn(name = "order_id", nullable = false)
private orderModel orderId;

@Column(name = "midtrans_id", nullable=false)
private String midtransId;

@Column(name = "payment_type", nullable=false)
private String paymentType;

@Column(name = "gross_amount", nullable=false)
private Double grossAmount;

@Column(name = "payment_time", nullable = false)
private LocalDateTime createdAt = LocalDateTime.now();

}
