package com.trustcart.backend.service;

import com.trustcart.backend.dto.ProductReviewRequestDTO;
import com.trustcart.backend.dto.ProductReviewResponseDTO;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.ProductReview;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.OrderItemRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.ProductReviewRepository;
import com.trustcart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public ProductReviewService(
            ProductReviewRepository reviewRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public List<ProductReviewResponseDTO> getReviewsForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        return reviewRepository.findByProductOrderByCreatedAtDesc(product)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public ProductReviewResponseDTO addReview(String email, Long productId, ProductReviewRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5 stars");
        }

        if (reviewRepository.existsByProductAndUser(product, user)) {
            throw new RuntimeException("You have already reviewed this product. Duplicate reviews are not allowed.");
        }

        boolean verified = orderItemRepository.hasUserPurchasedProduct(user, product);

        ProductReview review = new ProductReview(
                product,
                user,
                request.getRating(),
                request.getHeadline() != null && !request.getHeadline().isBlank() ? request.getHeadline() : "Verified Customer Review",
                request.getComment(),
                verified
        );

        ProductReview saved = reviewRepository.save(review);

        // Update product aggregate rating & count
        Double avg = reviewRepository.getAverageRatingForProduct(product);
        Long count = reviewRepository.getReviewCountForProduct(product);

        if (avg != null) {
            product.setRating(Math.round(avg * 10.0) / 10.0);
        }
        if (count != null) {
            product.setReviewCount(count.intValue());
        }
        productRepository.save(product);

        return mapToDTO(saved);
    }

    private ProductReviewResponseDTO mapToDTO(ProductReview review) {
        String email = review.getUser().getEmail();
        String maskedEmail = email;
        if (email != null && email.contains("@")) {
            String[] parts = email.split("@");
            if (parts[0].length() > 2) {
                maskedEmail = parts[0].charAt(0) + "***" + parts[0].charAt(parts[0].length() - 1) + "@" + parts[1];
            }
        }

        return new ProductReviewResponseDTO(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getName(),
                maskedEmail,
                review.getRating(),
                review.getHeadline(),
                review.getComment(),
                review.isVerifiedPurchase(),
                review.getCreatedAt()
        );
    }
}
