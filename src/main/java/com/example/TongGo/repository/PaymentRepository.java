package com.example.TongGo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.TongGo.model.paymentModel;
import java.util.Optional;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<paymentModel, Long> {
    
    Optional<paymentModel> findByMidtransId(String midtransId);
    
    Optional<paymentModel> findByTransactionId(String transactionId);
    
    Optional<paymentModel> findByOrderIdIdOrder(Long orderId);
    
    Optional<paymentModel> findByOrderIdOrderNumber(String orderNumber);
    
    List<paymentModel> findByPaymentStatus(String paymentStatus);
    
    List<paymentModel> findByPaymentStatusOrderByCreatedAtDesc(String paymentStatus);
}
