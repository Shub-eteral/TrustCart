package com.trustcart.backend.service;

import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {

        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // Add product to cart
    public CartItem addToCart(
            String email,
            Long productId,
            int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException(
                    "Not enough product stock available");
        }

        CartItem cartItem = cartItemRepository
                .findByUserAndProduct(user, product)
                .orElse(null);

        if (cartItem != null) {

            int newQuantity =
                    cartItem.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {
                throw new RuntimeException(
                        "Requested quantity exceeds available stock");
            }

            cartItem.setQuantity(newQuantity);

        } else {

            cartItem = new CartItem(
                    user,
                    product,
                    quantity
            );
        }

        return cartItemRepository.save(cartItem);
    }

    // View user's cart
    public List<CartItem> getCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return cartItemRepository.findByUser(user);
    }

    // Update cart quantity
    public CartItem updateQuantity(
            String email,
            Long cartItemId,
            int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot modify another user's cart");
        }

        if (quantity > cartItem.getProduct().getStock()) {
            throw new RuntimeException(
                    "Requested quantity exceeds available stock");
        }

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    // Remove one item from cart
    public void removeFromCart(
            String email,
            Long cartItemId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You cannot remove another user's cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    // Clear entire cart
    public void clearCart(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        cartItemRepository.deleteByUser(user);
    }
}