package com.example.TongGo.controller;

import com.example.TongGo.model.orderModel;
import com.example.TongGo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Endpoint untuk inisiasi order baru
     * POST /api/orders/init?userId=1&tableId=1
     */
    @PostMapping("/init")
    public ResponseEntity<?> initOrder(@RequestParam Long userId, @RequestParam Long tableId) {
        try {
            orderModel order = orderService.createOrder(userId, tableId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Mengambil semua daftar order
     */
    @GetMapping("/list")
    public List<orderModel> listAllOrders() {
        return orderService.getAllOrders();
    }

    /**
     * Mengambil detail order berdasarkan ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Mengambil daftar order milik user tertentu
     */
    @GetMapping("/user/{userId}")
    public List<orderModel> listUserOrders(@PathVariable Long userId) {
        return orderService.getOrdersByUser(userId);
    }

    @GetMapping("/{id}/items")
    public List<com.example.TongGo.model.orderItemsModel> getOrderItems(@PathVariable Long id) {
        return orderService.getOrderItems(id);
    }

    /**
     * Menghapus order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok("Order deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            orderModel updated = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Autowired
    private com.example.TongGo.service.ReceiptService receiptService;

    /**
     * Download PDF Receipt
     */
    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id) {
        try {
            orderModel order = orderService.getOrderById(id);
            byte[] pdfBytes = receiptService.generateReceiptPdf(order);

            String filename = "Receipt-" + (order.getOrderNumber() != null ? order.getOrderNumber() : id) + ".pdf";

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(null);
        }
    }
}
