package com.example.TongGo.model;

import lombok.Data;

@Data
public class orderItemsRequestDTO {
    private Double quantity;
    private Long orderId;
    private Long productId;
}
