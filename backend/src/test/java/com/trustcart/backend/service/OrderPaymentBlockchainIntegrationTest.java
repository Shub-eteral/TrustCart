package com.trustcart.backend.service;

import com.trustcart.backend.dto.OrderVerificationDTO;
import com.trustcart.backend.dto.PaymentConfirmDTO;
import com.trustcart.backend.dto.PaymentRequestDTO;
import com.trustcart.backend.dto.PaymentResponseDTO;
import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.OrderRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OrderPaymentBlockchainIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private Blockchain blockchain;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        String uniqueEmail = "buyer-" + UUID.randomUUID() + "@trustcart.io";
        testUser = userRepository.save(new User("Test Buyer", uniqueEmail, "password123", "CUSTOMER"));

        testProduct = productRepository.save(new Product(
                "Secure Ledger Device " + UUID.randomUUID().toString().substring(0, 5),
                "Hardware wallet with SHA-256 support",
                2499.0,
                50,
                "Electronics",
                UUID.randomUUID().toString()
        ));
    }

    @Test
    @Transactional
    void testCompletePaymentOrderAndVerificationFlow() {
        // 1. Add item to cart
        cartItemRepository.save(new CartItem(testUser, testProduct, 2));

        // 2. Create Payment Request
        PaymentRequestDTO paymentRequest = new PaymentRequestDTO();
        paymentRequest.setPaymentMethod("UPI");
        paymentRequest.setUpiId("buyer@oksbi");

        PaymentResponseDTO paymentInit = paymentService.createPayment(testUser.getEmail(), paymentRequest);
        assertNotNull(paymentInit);
        assertNotNull(paymentInit.getPaymentReferenceId());
        assertEquals(4998.0, paymentInit.getAmount());
        assertEquals("PENDING", paymentInit.getPaymentStatus());

        // 3. Test Simulated Payment Failure Flow
        PaymentConfirmDTO failRequest = new PaymentConfirmDTO();
        failRequest.setPaymentReferenceId(paymentInit.getPaymentReferenceId());
        failRequest.setSimulatedSuccess(false);

        PaymentResponseDTO failResult = paymentService.confirmPayment(testUser.getEmail(), failRequest);
        assertEquals("FAILED", failResult.getPaymentStatus());
        assertNull(failResult.getOrderId());
        // Cart should still exist after failure
        assertFalse(cartItemRepository.findByUser(testUser).isEmpty(), "Cart must remain intact on payment failure");

        // 4. Create new payment request and test Payment Success Flow
        PaymentResponseDTO newPaymentInit = paymentService.createPayment(testUser.getEmail(), paymentRequest);
        PaymentConfirmDTO successRequest = new PaymentConfirmDTO();
        successRequest.setPaymentReferenceId(newPaymentInit.getPaymentReferenceId());
        successRequest.setSimulatedSuccess(true);
        successRequest.setPaymentMethod("UPI");

        PaymentResponseDTO successResult = paymentService.confirmPayment(testUser.getEmail(), successRequest);
        assertEquals("SUCCESS", successResult.getPaymentStatus());
        assertNotNull(successResult.getOrderId());
        assertNotNull(successResult.getBlockchainHash());

        // Cart must be cleared after success
        assertTrue(cartItemRepository.findByUser(testUser).isEmpty(), "Cart must be cleared after successful order");

        // 5. Verify Order on Blockchain
        Long orderId = successResult.getOrderId();
        OrderVerificationDTO verification = orderService.verifyOrderBlockchain(orderId);

        assertTrue(verification.isValid(), "Fresh order must verify successfully on blockchain");
        assertEquals("Order blockchain verification successful", verification.getMessage());
        assertEquals(successResult.getBlockchainHash(), verification.getBlockchainHash());
        assertTrue(verification.isChainValid());

        // 6. Test Tamper Detection Demo
        orderService.tamperOrderForDemo(orderId, testUser.getEmail());

        OrderVerificationDTO tamperedVerification = orderService.verifyOrderBlockchain(orderId);
        assertFalse(tamperedVerification.isValid(), "Tampered order must fail verification!");
        assertTrue(tamperedVerification.getMessage().toLowerCase().contains("tampering detected"));

        // 7. Test Restoration Demo
        orderService.restoreOrderForDemo(orderId, testUser.getEmail());

        OrderVerificationDTO restoredVerification = orderService.verifyOrderBlockchain(orderId);
        assertTrue(restoredVerification.isValid(), "Restored order must verify successfully again");
    }
}
