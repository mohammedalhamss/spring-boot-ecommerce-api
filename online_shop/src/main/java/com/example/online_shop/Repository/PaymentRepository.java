package com.example.online_shop.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online_shop.Entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
	
	List<Payment> findByUserId(Long userId);

	

}
