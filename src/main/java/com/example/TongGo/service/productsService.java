package com.example.TongGo.service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.TongGo.model.productsModel;
import com.example.TongGo.repository.ProductsRepository;
@Service
public class productsService {
    @Autowired
    private ProductsRepository repo;
    public List<productsModel> ambilProduct(){
        return repo.findAll();
    } 

    public productsModel simpan(productsModel product){
        return repo.save(product);
    }

    public void hapus(Long id){
        repo.deleteById(id);
    }
    
    public void ubah(Long id, productsModel product){
        productsModel existingProduct = repo.findById(id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setName(product.getName());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setDescription(product.getDescription());
            repo.save(existingProduct);
        }
    }
    
}
