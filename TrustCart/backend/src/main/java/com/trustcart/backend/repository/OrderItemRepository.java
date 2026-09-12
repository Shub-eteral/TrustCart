package com.trustcart.backend.repository;

import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}