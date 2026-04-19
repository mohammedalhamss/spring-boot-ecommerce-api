package com.example.online_shop.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_shop.Entity.PaymentStatement;
import com.example.online_shop.Service.PaymentStatementService;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "http://localhost:8088", allowCredentials = "true")


public class PaymentStatementController {
	
	@Autowired
	PaymentStatementService paymentStatSer;
	
	

@GetMapping
public List<PaymentStatement> getStatements(){
	 return paymentStatSer.getStatements();
}


@GetMapping("/{id}")

public Optional<PaymentStatement> getStatementById(@PathVariable Long id){
	return paymentStatSer.getStatementById(id);
	 
}

	
	

}
