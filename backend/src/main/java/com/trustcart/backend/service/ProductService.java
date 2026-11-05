package com.trustcart.backend.service;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Add a new product
    public Product addProduct(Product product) {
        if (product.getProductHash() == null || product.getProductHash().isBlank()) {
            product.setProductHash(UUID.randomUUID().toString());
        }
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Paginated products
    public Page<Product> getProductsPaged(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    // Get product by ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // Get product using blockchain hash
    public Optional<Product> getProductByHash(String productHash) {
        return productRepository.findByProductHash(productHash);
    }

    // Search and filter products with pagination and sorting
    public Page<Product> searchAndFilterProducts(
            String query,
            String category,
            String brand,
            Double minPrice,
            Double maxPrice,
            Double minRating,
            Boolean availableOnly,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = Sort.by("id").descending();

        if (sortBy != null && !sortBy.isBlank()) {
            if ("price_asc".equalsIgnoreCase(sortBy) || ("price".equalsIgnoreCase(sortBy) && "asc".equalsIgnoreCase(sortDir))) {
                sort = Sort.by("price").ascending();
            } else if ("price_desc".equalsIgnoreCase(sortBy) || ("price".equalsIgnoreCase(sortBy) && "desc".equalsIgnoreCase(sortDir))) {
                sort = Sort.by("price").descending();
            } else if ("rating".equalsIgnoreCase(sortBy) || "highest_rated".equalsIgnoreCase(sortBy)) {
                sort = Sort.by("rating").descending();
            } else if ("newest".equalsIgnoreCase(sortBy)) {
                sort = Sort.by("id").descending();
            } else if ("popular".equalsIgnoreCase(sortBy) || "reviews".equalsIgnoreCase(sortBy)) {
                sort = Sort.by("reviewCount").descending();
            }
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), sort);

        return productRepository.searchAndFilterProducts(
                query != null && !query.isBlank() ? query.trim() : null,
                category != null && !category.isBlank() ? category.trim() : null,
                brand != null && !brand.isBlank() ? brand.trim() : null,
                minPrice,
                maxPrice,
                minRating,
                availableOnly,
                pageable
        );
    }

    // Get products by category
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public Page<Product> getProductsByCategoryPaged(String category, Pageable pageable) {
        return productRepository.findByCategoryIgnoreCase(category, pageable);
    }

    // Featured products
    public List<Product> getFeaturedProducts() {
        List<Product> featured = productRepository.findByFeaturedTrue();
        if (featured.isEmpty()) {
            return productRepository.findAll().stream().limit(8).toList();
        }
        return featured;
    }

    // Trending products
    public List<Product> getTrendingProducts() {
        List<Product> trending = productRepository.findByTrendingTrue();
        if (trending.isEmpty()) {
            return productRepository.findAll().stream().skip(4).limit(8).toList();
        }
        return trending;
    }

    // Top rated products
    public List<Product> getTopRatedProducts() {
        return productRepository.findTop10ByOrderByRatingDesc();
    }

    // Distinct Brands
    public List<String> getAllBrands() {
        return productRepository.findDistinctBrands();
    }

    // Distinct Categories
    public List<String> getAllCategories() {
        return productRepository.findDistinctCategories();
    }

    // Related products (same category, different id)
    public List<Product> getRelatedProducts(Long productId, int limit) {
        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty()) {
            return Collections.emptyList();
        }
        Product current = prodOpt.get();
        return productRepository.findByCategoryIgnoreCase(current.getCategory())
                .stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .toList();
    }

    // Update product
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setOriginalPrice(updatedProduct.getOriginalPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setBrand(updatedProduct.getBrand());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        existingProduct.setAdditionalImages(updatedProduct.getAdditionalImages());
        existingProduct.setSpecifications(updatedProduct.getSpecifications());

        return productRepository.save(existingProduct);
    }

    // Delete product
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }
        productRepository.deleteById(id);
    }
}
