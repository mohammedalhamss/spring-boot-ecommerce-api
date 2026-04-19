package com.example.online_shop.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online_shop.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

}
