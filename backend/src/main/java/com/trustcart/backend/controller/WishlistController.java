package com.trustcart.backend.controller;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getWishlist(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(wishlistService.getWishlist(email));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Product> addToWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        String email = authentication.getName();
        Product product = wishlistService.addToWishlist(email, productId);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {
        String email = authentication.getName();
        wishlistService.removeFromWishlist(email, productId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/move-to-cart/{productId}")
    public ResponseEntity<Void> moveToCart(
            @PathVariable Long productId,
            Authentication authentication) {
        String email = authentication.getName();
        wishlistService.moveToCart(email, productId);
        return ResponseEntity.ok().build();
    }
}
