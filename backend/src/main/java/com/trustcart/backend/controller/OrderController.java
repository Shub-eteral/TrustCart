package com.trustcart.backend.controller;

import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;
import com.trustcart.backend.service.Blockchain;
import com.trustcart.backend.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final Blockchain blockchain;

    public OrderController(
            OrderService orderService,
            Blockchain blockchain) {

        this.orderService = orderService;
        this.blockchain = blockchain;
    }

    // Place a new order from the user's cart
    @PostMapping
    public ResponseEntity<Order> placeOrder(
            Authentication authentication) {

        String email = authentication.getName();

        Order order = orderService.placeOrder(email);

        return ResponseEntity.ok(order);
    }

    // Get all orders of the logged-in user
    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                orderService.getUserOrders(email)
        );
    }

    // Get a specific order
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        Order order = orderService.getOrderById(orderId);

        // Security check
        if (!order.getUser().getEmail()
                .equals(authentication.getName())) {

            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(order);
    }

    // Get items belonging to an order
    @GetMapping("/{orderId}/items")
    public ResponseEntity<List<OrderItem>> getOrderItems(
            @PathVariable Long orderId,
            Authentication authentication) {

        Order order = orderService.getOrderById(orderId);

        // Security check
        if (!order.getUser().getEmail()
                .equals(authentication.getName())) {

            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.getOrderItems(orderId)
        );
    }

    // Verify order blockchain
    @GetMapping("/{orderId}/verify")
    public ResponseEntity<String> verifyOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        Order order = orderService.getOrderById(orderId);

        // Security check
        if (!order.getUser().getEmail()
                .equals(authentication.getName())) {

            return ResponseEntity.status(403)
                    .body("Access denied");
        }

        boolean orderValid =
                orderService.verifyOrderBlockchain(orderId);

        boolean blockchainValid =
                blockchain.isChainValid();

        if (orderValid && blockchainValid) {

            return ResponseEntity.ok(
                    "Order is authentic and blockchain is valid"
            );
        }

        return ResponseEntity.ok(
                "Order verification failed or blockchain was tampered with"
        );
    }
}
