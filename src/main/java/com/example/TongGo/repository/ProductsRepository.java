package com.example.TongGo.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.TongGo.model.productsModel;
import org.springframework.stereotype.Repository;
@Repository
public interface ProductsRepository extends JpaRepository<productsModel, Long> {
    
}
