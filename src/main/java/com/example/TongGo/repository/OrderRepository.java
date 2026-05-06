package com.example.TongGo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.TongGo.model.orderModel;
import com.example.TongGo.model.Paid;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<orderModel, Long> {
    
    Optional<orderModel> findByOrderNumber(String orderNumber);
    
    List<orderModel> findByStatus(Paid status);
    
    List<orderModel> findByUserIdId(Long userId);
    
    List<orderModel> findByTableIdIdTable(Long tableId);
}

