package com.trustcart.backend.controller;

import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.service.CartService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add product to cart
    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(
            Authentication authentication,
            @RequestParam Long productId,
            @RequestParam int quantity) {

        String email = authentication.getName();

        CartItem cartItem = cartService.addToCart(
                email,
                productId,
                quantity
        );

        return ResponseEntity.ok(cartItem);
    }

    // View cart
    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                cartService.getCart(email)
        );
    }

    // Update cart item quantity
    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItem> updateQuantity(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @RequestParam int quantity) {

        String email = authentication.getName();

        CartItem updatedItem = cartService.updateQuantity(
                email,
                cartItemId,
                quantity
        );

        return ResponseEntity.ok(updatedItem);
    }

    // Remove item from cart
    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(
            Authentication authentication,
            @PathVariable Long cartItemId) {

        String email = authentication.getName();

        cartService.removeFromCart(
                email,
                cartItemId
        );

        return ResponseEntity.noContent().build();
    }

    // Clear cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(
            Authentication authentication) {

        String email = authentication.getName();

        cartService.clearCart(email);

        return ResponseEntity.noContent().build();
    }
}