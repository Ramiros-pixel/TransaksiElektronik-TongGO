package com.example.TongGo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.TongGo.model.orderModel;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<orderModel, Long> {
    
}
