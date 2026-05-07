package com.example.TongGo.controller;

import com.example.TongGo.model.TableModel;
import com.example.TongGo.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
public class TableController {

    @Autowired
    private TableRepository tableRepository;

    @GetMapping
    public List<TableModel> getAllTables() {
        return tableRepository.findAll();
    }

    @PostMapping
    public TableModel createTable(@RequestBody TableModel table) {
        if (table.getQrIdentify() == null || table.getQrIdentify().trim().isEmpty()) {
            // Generate QR string unik otomatis jika tidak diisi
            table.setQrIdentify("QR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (table.getIsActive() == null) {
            table.setIsActive(true); // Default meja aktif
        }
        return tableRepository.save(table);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TableModel> updateTable(@PathVariable Long id, @RequestBody TableModel tableDetails) {
        TableModel table = tableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meja tidak ditemukan"));
        
        table.setTableNumber(tableDetails.getTableNumber());
        if(tableDetails.getQrIdentify() != null && !tableDetails.getQrIdentify().isEmpty()) {
            table.setQrIdentify(tableDetails.getQrIdentify());
        }
        if(tableDetails.getIsActive() != null) {
            table.setIsActive(tableDetails.getIsActive());
        }
        
        TableModel updatedTable = tableRepository.save(table);
        return ResponseEntity.ok(updatedTable);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id) {
        tableRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
