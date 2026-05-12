package com.example.TongGo.model;

import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.CascadeType;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonManagedReference;


@Entity
@Table(name = "orders")
@Data
public class orderModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrder;
    
    @Column(name = "order_number", nullable = false, unique = true)
    private String orderNumber; // Format: ORD-TIMESTAMP-RANDOM (e.g. ORD-1715000000123-ABC)

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private userModel userId;

    @ManyToOne
    @JoinColumn(name = "table_id", nullable = false)
    private TableModel tableId;

    @Column(name = "total_price", nullable = true)
    private Double totalPrice;

    @Column(name = "status", nullable = false)
    private Paid status;

    @OneToOne(mappedBy = "orderId", cascade = CascadeType.ALL)
    private paymentModel payment;

    @OneToMany(mappedBy = "orderId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<orderItemsModel> items;

    @Column(name = "order_time", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;
}
