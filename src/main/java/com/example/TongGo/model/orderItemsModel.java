package com.example.TongGo.model;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "order_items")
@Data

public class orderItemsModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id_item_Order;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private orderModel orderId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private productsModel productId;

    @Column(name = "quantity", nullable = false)
    private Double quantity;

    @Column(name = "subtotal", nullable = false)
    private Double subtotal;

}
