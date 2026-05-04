package com.example.TongGo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.TongGo.repository.KeranjangRepository;
import com.example.TongGo.model.orderItemsModel;
import com.example.TongGo.model.orderModel;
import com.example.TongGo.model.orderItemsRequestDTO;

import java.util.List;

import com.example.TongGo.model.productsModel;
import com.example.TongGo.repository.ProductsRepository;
import com.example.TongGo.repository.OrderRepository;

@Service
public class keranjangService {
    @Autowired
    private KeranjangRepository repo;
    @Autowired
    private ProductsRepository productsRepository;
    @Autowired
    private OrderRepository orderRepository;
    
    public List<orderItemsModel> ambilSemua(){
        return repo.findAll();
    }

    public orderItemsModel simpan(orderItemsRequestDTO request){
        System.out.println("Data Keranjang: " + request);
    
        // Validasi quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new RuntimeException("ERROR: Quantity harus lebih dari 0!");
        }
        
        // Validasi product ID
        if (request.getProductId() == null || request.getProductId() <= 0) {
            throw new RuntimeException("ERROR: Product ID tidak boleh kosong!");
        }
        
        // Fetch product dari database
        productsModel product = productsRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("ERROR: Produk dengan ID " + request.getProductId() + " tidak ditemukan!"));
        
        // Validasi order ID
        if (request.getOrderId() == null || request.getOrderId() <= 0) {
            throw new RuntimeException("ERROR: Order ID tidak boleh kosong!");
        }
        
        // Fetch order dari database
        orderModel order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("ERROR: Order dengan ID " + request.getOrderId() + " tidak ditemukan!"));
        
        // Cek apakah produk sudah ada di keranjang untuk order ini
        orderItemsModel keranjang = repo.findByOrderIdAndProductId(order, product).orElse(null);
        
        if (keranjang != null) {
            // Update quantity dan subtotal jika produk sudah ada
            keranjang.setQuantity(keranjang.getQuantity() + request.getQuantity());
            keranjang.setSubtotal(keranjang.getSubtotal() + (product.getPrice() * request.getQuantity()));
        } else {
            // Buat object keranjang baru jika produk belum ada
            keranjang = new orderItemsModel();
            keranjang.setProductId(product);
            keranjang.setOrderId(order);
            keranjang.setQuantity(request.getQuantity());
            keranjang.setSubtotal(product.getPrice() * request.getQuantity());
        }
        
        // Update total price pada order
        Double currentTotal = order.getTotalPrice() != null ? order.getTotalPrice() : 0.0;
        order.setTotalPrice(currentTotal + (product.getPrice() * request.getQuantity()));
        orderRepository.save(order);
        
        return repo.save(keranjang);
    }

    public void hapus(Long id){
        repo.deleteById(id);
    }

}
