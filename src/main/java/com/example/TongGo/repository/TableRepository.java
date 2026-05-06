package com.example.TongGo.repository;

import com.example.TongGo.model.TableModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TableRepository extends JpaRepository<TableModel, Long> {
}
