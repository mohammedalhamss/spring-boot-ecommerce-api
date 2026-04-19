package com.example.online_shop.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.online_shop.Entity.PaymentStatement;
import com.example.online_shop.Repository.PaymentStatementRepository;

@Service
public class PaymentStatementService {

	@Autowired
	PaymentStatementRepository paymentStatRepo;

	public List<PaymentStatement> getStatements() {

		return paymentStatRepo.findAll();
	}

	
	public Optional<PaymentStatement> getStatementById( Long id){
		return paymentStatRepo.findById(id);
	}
	
	
}
