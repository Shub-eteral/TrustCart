package com.trustcart.backend.config;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ProductDataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;

    public ProductDataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        boolean hasGroceries = productRepository.findAll().stream()
                .anyMatch(product -> "Groceries".equalsIgnoreCase(product.getCategory()));

        if (hasGroceries) {
            return;
        }

        productRepository.save(new Product(
                "Alphonso Mangoes",
                "Tree-ripened seasonal fruit, hand selected.",
                349,
                18,
                "Groceries",
                UUID.randomUUID().toString()));
        productRepository.save(new Product(
                "Roasted Arabica Coffee",
                "Small-batch beans with a silky finish.",
                599,
                24,
                "Groceries",
                UUID.randomUUID().toString()));
        productRepository.save(new Product(
                "Italian Bronze Pasta",
                "Slow-dried durum wheat pasta for dinner.",
                189,
                42,
                "Groceries",
                UUID.randomUUID().toString()));
        productRepository.save(new Product(
                "Wildflower Honey",
                "Raw, unfiltered honey from local apiaries.",
                425,
                16,
                "Groceries",
                UUID.randomUUID().toString()));
    }
}
