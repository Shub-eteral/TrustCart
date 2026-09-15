package com.trustcart.backend.repository;

import com.trustcart.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByProductHash(String productHash);

    boolean existsByProductHash(String productHash);

    boolean existsByName(String name);
}