package com.example.online_shop.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.online_shop.Entity.Product;
import com.example.online_shop.Repository.ProductRepository;

@Service
public class ProductService {
	
	@Autowired
	ProductRepository productRepo;
	
	

	public void newProduct(Product product) {
		productRepo.save(product);
		
	}
	
	public List<Product> getProducts(){
		return productRepo.findAll();
	}
	
	public Optional<Product> getProductById(Long id ){
		return productRepo.findById(id);
		
		
	}
	

}
