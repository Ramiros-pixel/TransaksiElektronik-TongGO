package com.example.TongGo.repository;

import com.example.TongGo.model.TableModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<TableModel, Long> {
    Optional<TableModel> findByTableNumber(Integer tableNumber);
    Optional<TableModel> findByQrIdentify(String qrIdentify);
}
