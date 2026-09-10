package com.trustcart.backend.repository;

import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUser(User user);
}