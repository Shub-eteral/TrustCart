package com.trustcart.backend.controller;

import com.trustcart.backend.dto.PaymentConfirmDTO;
import com.trustcart.backend.dto.PaymentRequestDTO;
import com.trustcart.backend.dto.PaymentResponseDTO;
import com.trustcart.backend.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Creates a payment request
    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDTO> createPayment(
            @RequestBody(required = false) PaymentRequestDTO request,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.createPayment(email, request);
        return ResponseEntity.ok(response);
    }

    // Confirms simulated payment result or processes gateway result
    @PostMapping("/confirm")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(
            @RequestBody PaymentConfirmDTO request,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.confirmPayment(email, request);
        return ResponseEntity.ok(response);
    }

    // Retrieves payment details
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(
            @PathVariable Long paymentId,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.getPaymentById(email, paymentId);
        return ResponseEntity.ok(response);
    }
}
