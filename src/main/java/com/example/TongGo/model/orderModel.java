package com.example.TongGo.model;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDateTime;


@Entity
@Table(name = "orders")
@Data
public class orderModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long idOrder;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private userModel userId;

    @ManyToOne
    @JoinColumn(name = "table_id", nullable = false)
    private TableModel tableId;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "status", nullable = false)
    private Paid status;

    @Column(name = "order_time", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
