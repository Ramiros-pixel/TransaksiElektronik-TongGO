package com.example.TongGo.service;

import com.example.TongGo.model.Paid;
import com.example.TongGo.model.TableModel;
import com.example.TongGo.model.orderModel;
import com.example.TongGo.model.userModel;
import com.example.TongGo.repository.OrderRepository;
import com.example.TongGo.repository.TableRepository;
import com.example.TongGo.repository.UserRepository;
import com.example.TongGo.model.orderItemsModel;
import com.example.TongGo.repository.KeranjangRepository;
import com.example.TongGo.util.OrderNumberGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TableRepository tableRepository;

    @Autowired
    private KeranjangRepository keranjangRepository;

    @Autowired
    private OrderNumberGenerator orderNumberGenerator;

    /**
     * Inisiasi Order baru (Langkah pertama saat user duduk di meja)
     */
    @Transactional
    public orderModel createOrder(Long userId, Long tableId) {

        TableModel table = tableRepository.findByTableNumber(tableId.intValue())
                .orElseThrow(() -> new RuntimeException("Meja nomor " + tableId + " tidak ditemukan"));

        userModel user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User tidak ditemukan dengan id " + userId));

        orderModel order = new orderModel();
        order.setUserId(user);
        order.setTableId(table);
        order.setTotalPrice(0.0);
        order.setStatus(Paid.pending);
        order.setOrderNumber(orderNumberGenerator.generateOrderNumber());
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Transactional
    public orderModel createGuestOrder(Long tableId) {
        TableModel table = tableRepository.findByTableNumber(tableId.intValue())
                .orElseThrow(() -> new RuntimeException("Meja nomor " + tableId + " tidak ditemukan"));

        // Create/find guest user.
        // Use a deterministic email so it can be re-used.
        String guestEmail = "guest-table-" + tableId + "@tonggo.local";

        userModel guest = userRepository.findByEmail(guestEmail).orElseGet(() -> {
            userModel u = new userModel();
            u.setUsername("Guest Table " + tableId);
            u.setEmail(guestEmail);
            u.setPassword("guest");
            u.setRole(com.example.TongGo.model.Role.USER);
            return userRepository.save(u);
        });

        orderModel order = new orderModel();
        order.setUserId(guest);
        order.setTableId(table);
        order.setTotalPrice(0.0);
        order.setStatus(Paid.pending);
        order.setOrderNumber(orderNumberGenerator.generateOrderNumber());
        order.setCreatedAt(LocalDateTime.now());

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<orderModel> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public orderModel getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order tidak ditemukan"));
    }

    @Transactional(readOnly = true)
    public List<orderModel> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<orderItemsModel> getOrderItems(Long orderId) {
        orderModel order = getOrderById(orderId);
        return keranjangRepository.findByOrderId(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
