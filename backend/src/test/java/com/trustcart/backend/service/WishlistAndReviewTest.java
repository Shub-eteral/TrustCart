package com.trustcart.backend.service;

import com.trustcart.backend.dto.ProductReviewRequestDTO;
import com.trustcart.backend.dto.ProductReviewResponseDTO;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class WishlistAndReviewTest {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private ProductReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        String email = "wishlist-test-" + UUID.randomUUID() + "@trustcart.io";
        testUser = userRepository.save(new User("Review Tester", email, "secret123", "CUSTOMER"));

        testProduct = productRepository.save(new Product(
                "Test Sound Pro " + UUID.randomUUID().toString().substring(0, 5),
                "Bose",
                "Headphones and Audio",
                "Premium testing headphones",
                9999.0,
                12999.0,
                20,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
                null,
                4.5,
                10,
                "Driver: 40mm",
                true,
                true,
                UUID.randomUUID().toString()
        ));
    }

    @Test
    @Transactional
    void testWishlistWorkflow() {
        // Add to wishlist
        Product added = wishlistService.addToWishlist(testUser.getEmail(), testProduct.getId());
        assertNotNull(added);
        assertEquals(testProduct.getId(), added.getId());

        // Get wishlist
        List<Product> wishlist = wishlistService.getWishlist(testUser.getEmail());
        assertEquals(1, wishlist.size());
        assertEquals(testProduct.getName(), wishlist.get(0).getName());

        // Move to cart
        wishlistService.moveToCart(testUser.getEmail(), testProduct.getId());

        // Wishlist should now be empty
        List<Product> emptyWishlist = wishlistService.getWishlist(testUser.getEmail());
        assertTrue(emptyWishlist.isEmpty());
    }

    @Test
    @Transactional
    void testReviewWorkflow() {
        ProductReviewRequestDTO req = new ProductReviewRequestDTO();
        req.setRating(5);
        req.setHeadline("Outstanding sound quality!");
        req.setComment("Deep bass and super crisp highs. Worth every rupee.");

        ProductReviewResponseDTO review = reviewService.addReview(testUser.getEmail(), testProduct.getId(), req);
        assertNotNull(review);
        assertEquals(5, review.getRating());
        assertEquals("Outstanding sound quality!", review.getHeadline());

        // List reviews
        List<ProductReviewResponseDTO> reviews = reviewService.getReviewsForProduct(testProduct.getId());
        assertFalse(reviews.isEmpty());
        assertEquals(5, reviews.get(0).getRating());

        // Duplicate review prevention
        assertThrows(RuntimeException.class, () -> reviewService.addReview(testUser.getEmail(), testProduct.getId(), req));
    }
}
