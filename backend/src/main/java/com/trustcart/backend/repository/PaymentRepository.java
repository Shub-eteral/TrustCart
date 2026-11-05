package com.trustcart.backend.repository;

import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.Payment;
import com.trustcart.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReferenceId(String paymentReferenceId);

    Optional<Payment> findByOrder(Order order);

    List<Payment> findByUser(User user);
}
