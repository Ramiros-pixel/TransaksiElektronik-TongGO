package com.example.TongGo.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import com.example.TongGo.service.productsService;
import com.example.TongGo.model.productsModel;
import java.util.List;
@RestController
@RequestMapping("/api/products")

public class productController {
    @Autowired
    private productsService service;

    @PostMapping("/tambah")
    public productsModel tambahProduct(@RequestBody productsModel products){
        return service.simpan(products);
    }

    @GetMapping("/display")
    public List<productsModel> tampilkanProduk(){
        return service.ambilProduct();
    }

    @DeleteMapping("/hapus/{id}")
    public void hapusProduct(@PathVariable Long id){
        service.hapus(id);
    }

    @PutMapping("/ubah/{id}")
    public void ubahProduct(@PathVariable Long id, @RequestBody productsModel products){
        service.ubah(id, products);
    }
    
}
