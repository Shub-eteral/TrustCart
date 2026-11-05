package com.trustcart.backend.service;

import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.model.WishlistItem;
import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;
import com.trustcart.backend.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            CartItemRepository cartItemRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
    }

    public List<Product> getWishlist(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return wishlistRepository.findByUserOrderByAddedAtDesc(user)
                .stream()
                .map(WishlistItem::getProduct)
                .toList();
    }

    @Transactional
    public Product addToWishlist(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        if (!wishlistRepository.existsByUserAndProduct(user, product)) {
            WishlistItem item = new WishlistItem(user, product);
            wishlistRepository.save(item);
        }

        return product;
    }

    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        wishlistRepository.findByUserAndProduct(user, product)
                .ifPresent(wishlistRepository::delete);
    }

    @Transactional
    public void moveToCart(String email, Long productId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // Add to cart if stock available
        if (product.getStock() > 0) {
            Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
            if (existing.isPresent()) {
                CartItem cartItem = existing.get();
                cartItem.setQuantity(cartItem.getQuantity() + 1);
                cartItemRepository.save(cartItem);
            } else {
                CartItem cartItem = new CartItem(user, product, 1);
                cartItemRepository.save(cartItem);
            }
        }

        // Remove from wishlist
        wishlistRepository.findByUserAndProduct(user, product)
                .ifPresent(wishlistRepository::delete);
    }
}
