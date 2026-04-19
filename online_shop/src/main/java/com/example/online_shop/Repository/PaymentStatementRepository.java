package com.example.online_shop.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.online_shop.Entity.PaymentStatement;

public interface PaymentStatementRepository extends JpaRepository<PaymentStatement, Long> {

}
