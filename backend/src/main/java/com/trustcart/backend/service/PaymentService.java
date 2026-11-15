package com.trustcart.backend.service;

import com.trustcart.backend.dto.PaymentConfirmDTO;
import com.trustcart.backend.dto.PaymentRequestDTO;
import com.trustcart.backend.dto.PaymentResponseDTO;
import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.Payment;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.OrderRepository;
import com.trustcart.backend.repository.PaymentRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${payment.razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${payment.razorpay.enabled:false}")
    private boolean razorpayEnabled;

    public PaymentService(
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    // Create a new payment request for user's active cart
    @Transactional
    public PaymentResponseDTO createPayment(String email, PaymentRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        // Auto-sync items from request payload if database cart was cleared
        if (cartItems.isEmpty() && request != null && request.getItems() != null && !request.getItems().isEmpty()) {
            for (PaymentRequestDTO.ItemDTO itemDTO : request.getItems()) {
                if (itemDTO.getProductId() != null && itemDTO.getQuantity() > 0) {
                    Product p = productRepository.findById(itemDTO.getProductId()).orElse(null);
                    if (p != null) {
                        cartItemRepository.save(new CartItem(user, p, itemDTO.getQuantity()));
                    }
                }
            }
            cartItems = cartItemRepository.findByUser(user);
        }

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot initiate payment.");
        }

        // Validate server-side amount based on cart items
        double totalAmount = 0.0;
        for (CartItem item : cartItems) {
            if (item.getProduct().getStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + item.getProduct().getName());
            }
            totalAmount += item.getProduct().getPrice() * item.getQuantity();
        }

        String paymentMethod = request != null && request.getPaymentMethod() != null
                ? request.getPaymentMethod().toUpperCase()
                : "UPI";

        // Generate unique payment reference
        String referenceId = "TC-PAY-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentReferenceId(referenceId);

        if (request != null) {
            if (request.getUpiId() != null && !request.getUpiId().isBlank()) {
                payment.setTransactionDetails("UPI: " + request.getUpiId());
            } else if (request.getCardLast4() != null && !request.getCardLast4().isBlank()) {
                payment.setTransactionDetails("CARD: Ending in " + request.getCardLast4());
            }
        }

        Payment savedPayment = paymentRepository.save(payment);

        PaymentResponseDTO response = mapToDTO(savedPayment);
        response.setMessage("Payment initiated successfully");
        response.setRazorpayEnabled(razorpayEnabled);
        response.setRazorpayKeyId(razorpayEnabled ? razorpayKeyId : null);
        return response;
    }

    // Confirm simulated payment or process gateway response
    @Transactional
    public PaymentResponseDTO confirmPayment(String email, PaymentConfirmDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Payment payment = null;
        if (request != null && request.getPaymentReferenceId() != null && !request.getPaymentReferenceId().isBlank()) {
            payment = paymentRepository.findByPaymentReferenceId(request.getPaymentReferenceId())
                    .orElse(null);
        }

        if (payment == null && request != null && request.getPaymentId() != null) {
            payment = paymentRepository.findById(request.getPaymentId())
                    .orElse(null);
        }

        // Auto-create payment if not pre-initiated or not found in database
        if (payment == null) {
            PaymentRequestDTO initReq = new PaymentRequestDTO();
            if (request != null) {
                if (request.getPaymentMethod() != null) {
                    initReq.setPaymentMethod(request.getPaymentMethod());
                }
                if (request.getItems() != null) {
                    initReq.setItems(request.getItems());
                }
            }
            PaymentResponseDTO initResp = createPayment(email, initReq);
            payment = paymentRepository.findById(initResp.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Failed to initialize payment for confirmation"));
        }

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: You do not own this payment transaction");
        }

        // Avoid duplicate processing if already completed
        if ("SUCCESS".equalsIgnoreCase(payment.getPaymentStatus()) || "COD".equalsIgnoreCase(payment.getPaymentStatus())) {
            PaymentResponseDTO response = mapToDTO(payment);
            response.setMessage("Payment has already been processed");
            return response;
        }

        if (request != null && request.getPaymentMethod() != null && !request.getPaymentMethod().isBlank()) {
            payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        }

        boolean isCod = "COD".equalsIgnoreCase(payment.getPaymentMethod());
        boolean simulatedSuccess = request == null || request.isSimulatedSuccess();

        // Simulated payment failure check
        if (!simulatedSuccess && !isCod) {
            payment.setPaymentStatus("FAILED");
            payment.setFailureReason("Transaction declined by bank or simulated failure test");
            Payment failedPayment = paymentRepository.save(payment);
            PaymentResponseDTO response = mapToDTO(failedPayment);
            response.setMessage("Payment failed. No order was created.");
            return response;
        }

        // Clear any previous failure reason on success retry
        payment.setFailureReason(null);

        // Process successful payment or Cash on Delivery
        if (isCod) {
            payment.setPaymentStatus("COD");
            payment.setTransactionDetails(request != null && request.getTransactionNote() != null
                    ? request.getTransactionNote()
                    : "Cash on Delivery chosen");
        } else {
            payment.setPaymentStatus("SUCCESS");
            if (request != null && request.getTransactionNote() != null) {
                payment.setTransactionDetails(request.getTransactionNote());
            }
        }

        // Confirm order and secure on blockchain
        Order order = orderService.confirmOrderFromPayment(user, payment);
        payment.setOrder(order);
        Payment savedPayment = paymentRepository.save(payment);

        PaymentResponseDTO response = mapToDTO(savedPayment);
        response.setOrderId(order.getId());
        response.setBlockchainHash(order.getBlockchainHash());
        response.setMessage(isCod
                ? "Order placed successfully with Cash on Delivery (Blockchain Secured)"
                : "Payment successful and order secured on TrustCart Blockchain");
        return response;
    }

    // Get payment by ID
    public PaymentResponseDTO getPaymentById(String email, Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment record not found: " + paymentId));

        if (!payment.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: Not authorized to view this payment");
        }

        return mapToDTO(payment);
    }

    // Get payment by Order ID
    public PaymentResponseDTO getPaymentByOrderId(String email, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: Not authorized to view this order payment");
        }

        Payment payment = paymentRepository.findByOrder(order)
                .orElseGet(() -> {
                    // Create fallback payment representation if placed through direct legacy API
                    Payment fallback = new Payment();
                    fallback.setId(0L);
                    fallback.setOrder(order);
                    fallback.setUser(order.getUser());
                    fallback.setAmount(order.getTotalAmount());
                    fallback.setPaymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod() : "DIRECT");
                    fallback.setPaymentStatus(order.getPaymentStatus() != null ? order.getPaymentStatus() : "SUCCESS");
                    fallback.setPaymentReferenceId(order.getPaymentReference() != null ? order.getPaymentReference() : "LEGACY-" + order.getId());
                    fallback.setPaymentDate(order.getOrderDate());
                    return fallback;
                });

        PaymentResponseDTO dto = mapToDTO(payment);
        dto.setOrderId(order.getId());
        dto.setBlockchainHash(order.getBlockchainHash());
        return dto;
    }

    private PaymentResponseDTO mapToDTO(Payment payment) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setPaymentId(payment.getId());
        dto.setPaymentReferenceId(payment.getPaymentReferenceId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentStatus(payment.getPaymentStatus());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setFailureReason(payment.getFailureReason());
        if (payment.getOrder() != null) {
            dto.setOrderId(payment.getOrder().getId());
            dto.setBlockchainHash(payment.getOrder().getBlockchainHash());
        }
        return dto;
    }
}
