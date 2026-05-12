package com.example.TongGo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.TongGo.model.orderItemsModel;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.TongGo.model.orderModel;
import com.example.TongGo.model.productsModel;

import java.util.List;

@Repository
public interface KeranjangRepository extends JpaRepository<orderItemsModel, Long> {
    @Query("SELECT k FROM orderItemsModel k WHERE k.orderId = :order AND k.productId = :product")
    Optional<orderItemsModel> findByOrderIdAndProductId(@Param("order") orderModel order, @Param("product") productsModel product);

    List<orderItemsModel> findByOrderId(orderModel orderId);
}
