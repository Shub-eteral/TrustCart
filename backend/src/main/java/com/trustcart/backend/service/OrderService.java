package com.trustcart.backend.service;

import com.trustcart.backend.dto.OrderVerificationDTO;
import com.trustcart.backend.model.Block;
import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;
import com.trustcart.backend.model.Payment;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.OrderItemRepository;
import com.trustcart.backend.repository.OrderRepository;
import com.trustcart.backend.repository.PaymentRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PaymentRepository paymentRepository;
    private final Blockchain blockchain;
    private final BlockchainService blockchainService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            PaymentRepository paymentRepository,
            Blockchain blockchain,
            BlockchainService blockchainService) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.blockchain = blockchain;
        this.blockchainService = blockchainService;
    }

    // Confirm and place order following successful payment or COD selection
    @Transactional
    public Order confirmOrderFromPayment(User user, Payment payment) {
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty. Cannot create order.");
        }

        // Validate stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + product.getName());
            }
        }

        boolean isCod = "COD".equalsIgnoreCase(payment.getPaymentMethod());

        // Create order entity
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(payment.getAmount());
        order.setOriginalAmount(payment.getAmount());
        order.setStatus(isCod ? "PLACED" : "CONFIRMED");
        order.setOrderDate(LocalDateTime.now());
        order.setPaymentMethod(payment.getPaymentMethod());
        order.setPaymentStatus(payment.getPaymentStatus());
        order.setPaymentReference(payment.getPaymentReferenceId());

        Order savedOrder = orderRepository.save(order);

        // 1. Build canonical transaction data
        String transactionData = blockchainService.createTransactionData(
                savedOrder.getId(),
                user.getEmail(),
                savedOrder.getTotalAmount(),
                savedOrder.getOrderDate()
        );

        // 2. Add block to blockchain
        Block block = blockchain.addBlock(transactionData);

        // 3. Link block hash with order
        savedOrder.setBlockchainHash(block.getHash());
        savedOrder = orderRepository.save(savedOrder);

        // 4. Save order items and reduce stock
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    cartItem.getQuantity(),
                    product.getPrice()
            );
            orderItemRepository.save(orderItem);

            // Deduct stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // 5. Clear cart
        cartItemRepository.deleteByUser(user);

        return savedOrder;
    }

    // Direct legacy checkout endpoint support
    @Transactional
    public Order placeOrder(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double totalAmount = 0.0;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Not enough stock for: " + product.getName());
            }
            totalAmount += product.getPrice() * cartItem.getQuantity();
        }

        // Create payment record for legacy direct order
        String paymentRef = "TC-PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Payment payment = new Payment(
                user,
                null,
                paymentRef,
                "DIRECT",
                totalAmount,
                "SUCCESS",
                LocalDateTime.now()
        );
        payment = paymentRepository.save(payment);

        Order savedOrder = confirmOrderFromPayment(user, payment);
        payment.setOrder(savedOrder);
        paymentRepository.save(payment);

        return savedOrder;
    }

    // Get all orders of a user
    public List<Order> getUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user);
    }

    // Get a specific order
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    // Get items belonging to an order
    public List<OrderItem> getOrderItems(Long orderId) {
        Order order = getOrderById(orderId);
        return orderItemRepository.findByOrder(order);
    }

    // Cancel an order
    @Transactional
    public Order cancelOrder(Long orderId, String email) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized to cancel this order");
        }

        if (!"PLACED".equals(order.getStatus()) && !"CONFIRMED".equals(order.getStatus())) {
            throw new RuntimeException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem orderItem : orderItems) {
            Product product = orderItem.getProduct();
            product.setStock(product.getStock() + orderItem.getQuantity());
            productRepository.save(product);
        }

        order.setStatus("CANCELLED");
        return orderRepository.save(order);
    }

    // Verify blockchain record of an order with tamper detection
    public OrderVerificationDTO verifyOrderBlockchain(Long orderId) {
        Order order = getOrderById(orderId);
        String storedHash = order.getBlockchainHash();

        if (storedHash == null || storedHash.isBlank()) {
            return new OrderVerificationDTO(
                    orderId,
                    false,
                    "Order has no blockchain record attached.",
                    null,
                    null,
                    null,
                    null,
                    blockchain.isChainValid(),
                    null
            );
        }

        // Recalculate transaction data using current order state from DB
        String currentOrderTxData = blockchainService.createTransactionData(
                order.getId(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getOrderDate()
        );

        // Find the block in blockchain by stored hash
        Optional<Block> matchingBlockOpt = blockchain.findBlockByHash(storedHash);

        if (matchingBlockOpt.isEmpty()) {
            return new OrderVerificationDTO(
                    orderId,
                    false,
                    "Tampering detected! The stored blockchain hash does not correspond to any valid block in the ledger.",
                    storedHash,
                    null,
                    null,
                    null,
                    blockchain.isChainValid(),
                    null
            );
        }

        Block block = matchingBlockOpt.get();

        // Check 1: Does the database order data match the immutable block data?
        if (!block.getData().equals(currentOrderTxData)) {
            // Tampering detected: DB record has been altered!
            String recalculatedHash = blockchainService.calculateBlockHash(
                    block.getIndex(),
                    block.getPreviousHash(),
                    currentOrderTxData
            );

            return new OrderVerificationDTO(
                    orderId,
                    false,
                    "Tampering detected! Database order fields (Amount/User/Date) do not match the immutable blockchain block data.",
                    storedHash,
                    recalculatedHash,
                    block.getIndex(),
                    block.getPreviousHash(),
                    blockchain.isChainValid(),
                    block.getTimestamp().toString()
            );
        }

        // Check 2: Recalculate block hash and verify block integrity
        String recalculatedBlockHash = blockchainService.calculateBlockHash(
                block.getIndex(),
                block.getPreviousHash(),
                block.getData()
        );

        if (!block.getHash().equals(recalculatedBlockHash)) {
            return new OrderVerificationDTO(
                    orderId,
                    false,
                    "Tampering detected! Block cryptographic hash is invalid or corrupted.",
                    storedHash,
                    recalculatedBlockHash,
                    block.getIndex(),
                    block.getPreviousHash(),
                    false,
                    block.getTimestamp().toString()
            );
        }

        // Check 3: Check chain link to previous block
        if (block.getIndex() > 0) {
            Optional<Block> prevBlockOpt = blockchain.findBlockByIndex(block.getIndex() - 1);
            if (prevBlockOpt.isEmpty() || !block.getPreviousHash().equals(prevBlockOpt.get().getHash())) {
                return new OrderVerificationDTO(
                        orderId,
                        false,
                        "Tampering detected! Blockchain link broken: previousHash does not match parent block hash.",
                        storedHash,
                        recalculatedBlockHash,
                        block.getIndex(),
                        block.getPreviousHash(),
                        false,
                        block.getTimestamp().toString()
                );
            }
        }

        // Check 4: Check entire blockchain validity
        boolean wholeChainValid = blockchain.isChainValid();
        if (!wholeChainValid) {
            return new OrderVerificationDTO(
                    orderId,
                    false,
                    "Tampering detected! Complete blockchain integrity validation failed.",
                    storedHash,
                    recalculatedBlockHash,
                    block.getIndex(),
                    block.getPreviousHash(),
                    false,
                    block.getTimestamp().toString()
            );
        }

        // All checks passed!
        return new OrderVerificationDTO(
                orderId,
                true,
                "Order blockchain verification successful",
                storedHash,
                recalculatedBlockHash,
                block.getIndex(),
                block.getPreviousHash(),
                true,
                block.getTimestamp().toString()
        );
    }

    // Controlled demo method for presentation: tamper order amount in database
    @Transactional
    public Order tamperOrderForDemo(Long orderId, String email) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Cannot modify this order");
        }

        if (order.getOriginalAmount() == null) {
            order.setOriginalAmount(order.getTotalAmount());
        }

        // Alter order amount to simulate unauthorized data tampering
        order.setTotalAmount(order.getTotalAmount() + 5000.00);
        return orderRepository.save(order);
    }

    // Controlled demo method for presentation: restore original order amount
    @Transactional
    public Order restoreOrderForDemo(Long orderId, String email) {
        Order order = getOrderById(orderId);

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Unauthorized: Cannot modify this order");
        }

        if (order.getOriginalAmount() != null) {
            order.setTotalAmount(order.getOriginalAmount());
        }

        return orderRepository.save(order);
    }
}
