package com.trustcart.backend.controller;

import com.trustcart.backend.dto.AffiliateProductDTO;
import com.trustcart.backend.dto.ProductReviewRequestDTO;
import com.trustcart.backend.dto.ProductReviewResponseDTO;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.service.FlipkartAffiliateService;
import com.trustcart.backend.service.ProductReviewService;
import com.trustcart.backend.service.ProductService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ProductReviewService reviewService;
    private final FlipkartAffiliateService affiliateService;

    public ProductController(
            ProductService productService,
            ProductReviewService reviewService,
            FlipkartAffiliateService affiliateService) {
        this.productService = productService;
        this.reviewService = reviewService;
        this.affiliateService = affiliateService;
    }

    // Get all products or paginated - PUBLIC
    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null) {
            Page<Product> paged = productService.getProductsPaged(PageRequest.of(page, size));
            return ResponseEntity.ok(paged);
        }

        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Search and filter endpoint with full pagination & sorting - PUBLIC
    @GetMapping({"/search", "/filter"})
    public ResponseEntity<Page<Product>> searchAndFilter(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false, defaultValue = "false") Boolean availableOnly,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "16") int size,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "desc") String dir) {

        Page<Product> results = productService.searchAndFilterProducts(
                q, category, brand, minPrice, maxPrice, rating, availableOnly, page, size, sort, dir
        );

        return ResponseEntity.ok(results);
    }

    // Get products by category - PUBLIC
    @GetMapping("/category/{category}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        if (page != null && size != null) {
            return ResponseEntity.ok(
                    productService.getProductsByCategoryPaged(category, PageRequest.of(page, size))
            );
        }

        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    // Get featured products - PUBLIC
    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    // Get trending products - PUBLIC
    @GetMapping("/trending")
    public ResponseEntity<List<Product>> getTrendingProducts() {
        return ResponseEntity.ok(productService.getTrendingProducts());
    }

    // Get top-rated products - PUBLIC
    @GetMapping("/top-rated")
    public ResponseEntity<List<Product>> getTopRatedProducts() {
        return ResponseEntity.ok(productService.getTopRatedProducts());
    }

    // Get distinct brands - PUBLIC
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getAllBrands() {
        return ResponseEntity.ok(productService.getAllBrands());
    }

    // Get distinct categories - PUBLIC
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    // Get product by ID - PUBLIC
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get related products - PUBLIC
    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "6") int limit) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, limit));
    }

    // Get product by blockchain hash - PUBLIC
    @GetMapping("/verify/{productHash}")
    public ResponseEntity<Product> getProductByHash(@PathVariable String productHash) {
        return productService.getProductByHash(productHash)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get product reviews - PUBLIC
    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ProductReviewResponseDTO>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(id));
    }

    // Submit product review - AUTHENTICATED
    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> addProductReview(
            @PathVariable Long id,
            @RequestBody ProductReviewRequestDTO request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Sign in required to review"));
        }
        String email = authentication.getName();
        ProductReviewResponseDTO response = reviewService.addReview(email, id, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Optional Flipkart Affiliate Search - PUBLIC
    @GetMapping("/affiliate")
    public ResponseEntity<List<AffiliateProductDTO>> getAffiliateProducts(@RequestParam(required = false, defaultValue = "") String q) {
        return ResponseEntity.ok(affiliateService.searchAffiliateProducts(q));
    }

    // Add a new product - ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product savedProduct = productService.addProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    // Update product - ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    // Delete product - ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
