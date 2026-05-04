package com.example.TongGo.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.example.TongGo.service.keranjangService;
import com.example.TongGo.model.orderItemsModel;
import com.example.TongGo.model.orderItemsRequestDTO;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
@RestController
@RequestMapping("/api/keranjang")
public class keranjangController {
    @Autowired
    private keranjangService service;

    @PostMapping("/tambah")
    public orderItemsModel tambahItem(@RequestBody orderItemsRequestDTO request){
        return service.simpan(request);
    }

    @GetMapping("/display")
    public List<orderItemsModel> tampilkanItem(){
        return service.ambilSemua();
    }

    @DeleteMapping("/hapus/{id}")
    public void hapusItem(@PathVariable Long id){
        service.hapus(id);
    }
    
}
