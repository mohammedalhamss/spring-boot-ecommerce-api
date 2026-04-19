package com.example.online_shop.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.online_shop.Entity.Payment;
import com.example.online_shop.Service.PaymentService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
	
	

    @Autowired
    PaymentService paymentServ;

    @PostMapping("/product/{productId}")
    public ResponseEntity<?> makePayment(
            @PathVariable Long productId,
			HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(401).body("User not logged in");
        }

        Payment payment = paymentServ.makePayment(userId, productId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentServ.getAllPayments();
    }

    @GetMapping("/user/{userId}")
    public List<Payment> getPaymentsByUser(@PathVariable Long userId) {
        return paymentServ.getPaymentsByUser(userId);
    }
}