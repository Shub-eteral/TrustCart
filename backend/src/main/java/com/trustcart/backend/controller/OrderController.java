package com.trustcart.backend.controller;

import com.trustcart.backend.dto.OrderVerificationDTO;
import com.trustcart.backend.dto.PaymentResponseDTO;
import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;
import com.trustcart.backend.service.Blockchain;
import com.trustcart.backend.service.OrderService;
import com.trustcart.backend.service.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final Blockchain blockchain;

    public OrderController(
            OrderService orderService,
            PaymentService paymentService,
            Blockchain blockchain) {

        this.orderService = orderService;
        this.paymentService = paymentService;
        this.blockchain = blockchain;
    }

    // Place a new order from the user's cart (legacy / direct checkout)
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
        if (!order.getUser().getEmail().equals(authentication.getName())) {
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
        if (!order.getUser().getEmail().equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(
                orderService.getOrderItems(orderId)
        );
    }

    // Verify order blockchain (Module 1, Section 5)
    @GetMapping("/{orderId}/verify")
    public ResponseEntity<OrderVerificationDTO> verifyOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        Order order = orderService.getOrderById(orderId);

        // Security check: only order owner can verify
        if (!order.getUser().getEmail().equals(authentication.getName())) {
            OrderVerificationDTO forbidden = new OrderVerificationDTO();
            forbidden.setOrderId(orderId);
            forbidden.setValid(false);
            forbidden.setMessage("Access denied: Not authorized to verify this order");
            return ResponseEntity.status(403).body(forbidden);
        }

        OrderVerificationDTO result = orderService.verifyOrderBlockchain(orderId);
        return ResponseEntity.ok(result);
    }

    // Retrieve payment information for an order (Module 2, Section 11)
    @GetMapping("/{orderId}/payment")
    public ResponseEntity<PaymentResponseDTO> getOrderPayment(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO payment = paymentService.getPaymentByOrderId(email, orderId);
        return ResponseEntity.ok(payment);
    }

    // Cancel an order
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        Order cancelledOrder = orderService.cancelOrder(orderId, email);
        return ResponseEntity.ok(cancelledOrder);
    }

    // Controlled presentation demonstration: simulate data tampering (Module 1, Section 6)
    @PostMapping("/{orderId}/tamper-test")
    public ResponseEntity<Map<String, Object>> tamperOrderForDemo(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        Order tamperedOrder = orderService.tamperOrderForDemo(orderId, email);

        return ResponseEntity.ok(Map.of(
                "orderId", tamperedOrder.getId(),
                "originalAmount", tamperedOrder.getOriginalAmount(),
                "tamperedAmount", tamperedOrder.getTotalAmount(),
                "blockchainHash", tamperedOrder.getBlockchainHash(),
                "message", "Order data tampered in database for college presentation demo! Recalculated hash will now differ from the blockchain hash."
        ));
    }

    // Controlled presentation demonstration: restore order data
    @PostMapping("/{orderId}/restore-test")
    public ResponseEntity<Map<String, Object>> restoreOrderForDemo(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        Order restoredOrder = orderService.restoreOrderForDemo(orderId, email);

        return ResponseEntity.ok(Map.of(
                "orderId", restoredOrder.getId(),
                "restoredAmount", restoredOrder.getTotalAmount(),
                "blockchainHash", restoredOrder.getBlockchainHash(),
                "message", "Original order data restored. Verification on blockchain will now succeed!"
        ));
    }
}
