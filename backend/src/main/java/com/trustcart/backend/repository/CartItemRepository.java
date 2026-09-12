package com.trustcart.backend.repository;

import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.User;
import com.trustcart.backend.model.Product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndProduct(User user, Product product);

    void deleteByUser(User user);
}