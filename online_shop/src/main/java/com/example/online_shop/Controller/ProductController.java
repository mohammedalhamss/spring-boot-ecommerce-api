package com.example.online_shop.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.online_shop.Entity.Product;
import com.example.online_shop.Service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:8088/admin.html")
public class ProductController {

    @Autowired
    ProductService productServ;

    @PostMapping
    public ResponseEntity<?> newProduct(@RequestBody Product product) {
        try {
            productServ.newProduct(product);
            return ResponseEntity.ok().body("{\"message\": \"Product saved successfully\", \"id\": " + product.getId() + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping
    public List<Product> getProducts() {
        return productServ.getProducts();
    }

    @GetMapping("/{id}")
    public Optional<Product> getProductById(@PathVariable Long id) {
        return productServ.getProductById(id);
    }
}