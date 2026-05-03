package com.example.TongGo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.Data;
import lombok.Data;
import jakarta.persistence.Id;
@Entity
@Table(name = "tables")
@Data

public class TableModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTable;   

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;
    @Column(name = "qr_identify", nullable = false)
    private String qrIdentify;
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

}
