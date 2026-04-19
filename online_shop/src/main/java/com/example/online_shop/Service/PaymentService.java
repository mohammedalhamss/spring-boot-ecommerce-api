package com.example.online_shop.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.online_shop.Entity.Payment;
import com.example.online_shop.Entity.PaymentStatement;
import com.example.online_shop.Entity.PaymentStatus;
import com.example.online_shop.Entity.Product;
import com.example.online_shop.Entity.User;
import com.example.online_shop.Repository.PaymentRepository;
import com.example.online_shop.Repository.PaymentStatementRepository;
import com.example.online_shop.Repository.ProductRepository;
import com.example.online_shop.Repository.UserRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final  PaymentStatementRepository paymentStatementRepo;

    public PaymentService(
            PaymentRepository paymentRepo,
            PaymentStatementRepository paymentStRepo,
            UserRepository userRepo,
            ProductRepository productRepo
    ) {
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.paymentStatementRepo= paymentStRepo;
    }

    
    @Transactional
    public Payment makePayment(Long userId, Long productId) {


        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

       
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

     
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setProduct(product);
        payment.setAmount(product.getPrice());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        
        
        PaymentStatement statement = new PaymentStatement();
        statement.setTransactionId(UUID.randomUUID().toString());
        statement.setAmount(product.getPrice());
        statement.setStatus(PaymentStatus.SUCCESS);
        statement.setCreatedAt(LocalDateTime.now());
        statement.setUser(user);
        statement.setProduct(product);

        paymentStatementRepo.save(statement); 


       
        return paymentRepo.save(payment);
    }

    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    public List<Payment> getPaymentsByUser(Long userId) {
        return paymentRepo.findByUserId(userId);
    }
}
