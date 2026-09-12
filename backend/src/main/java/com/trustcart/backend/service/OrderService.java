package com.trustcart.backend.service;

import com.trustcart.backend.model.Block;
import com.trustcart.backend.model.CartItem;
import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;

import com.trustcart.backend.repository.CartItemRepository;
import com.trustcart.backend.repository.OrderItemRepository;
import com.trustcart.backend.repository.OrderRepository;
import com.trustcart.backend.repository.ProductRepository;
import com.trustcart.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final Blockchain blockchain;
    private final BlockchainService blockchainService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            Blockchain blockchain,
            BlockchainService blockchainService) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.blockchain = blockchain;
        this.blockchainService = blockchainService;
    }

    // Place order from the user's cart
    @Transactional
    public Order placeOrder(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double totalAmount = 0;

        // Check stock and calculate total
        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Not enough stock for: "
                                + product.getName());
            }

            totalAmount +=
                    product.getPrice()
                            * cartItem.getQuantity();
        }

        // Create order
        Order order = new Order(
                user,
                totalAmount,
                "PLACED",
                LocalDateTime.now()
        );

        Order savedOrder = orderRepository.save(order);

        /*
         * Create blockchain data for the order.
         */
        String blockchainData =
                "ORDER_ID=" + savedOrder.getId()
                        + "|USER=" + user.getEmail()
                        + "|TOTAL=" + totalAmount
                        + "|DATE=" + savedOrder.getOrderDate();

        /*
         * Add order information to blockchain.
         */
        Block block = blockchain.addBlock(blockchainData);

        /*
         * Store blockchain hash inside the order.
         */
        savedOrder.setBlockchainHash(block.getHash());

        savedOrder = orderRepository.save(savedOrder);

        // Convert cart items into order items
        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    cartItem.getQuantity(),
                    product.getPrice()
            );

            orderItemRepository.save(orderItem);

            // Reduce product stock
            product.setStock(
                    product.getStock()
                            - cartItem.getQuantity()
            );

            productRepository.save(product);
        }

        // Clear cart after successful order
        cartItemRepository.deleteByUser(user);

        return savedOrder;
    }

    // Get all orders of a user
    public List<Order> getUserOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return orderRepository.findByUser(user);
    }

    // Get a specific order
    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
    }

    // Get items belonging to an order
    public List<OrderItem> getOrderItems(Long orderId) {

        Order order = getOrderById(orderId);

        return orderItemRepository.findByOrder(order);
    }

    // Verify blockchain record of an order
    public boolean verifyOrderBlockchain(Long orderId) {

        Order order = getOrderById(orderId);

        String storedHash = order.getBlockchainHash();

        if (storedHash == null || storedHash.isBlank()) {
            return false;
        }

        /*
         * Find the blockchain block using the hash
         * stored inside the order.
         */
        for (Block block : blockchain.getChain()) {

            if (storedHash.equals(block.getHash())) {

                /*
                 * Recalculate the hash using the exact
                 * block data that was originally used.
                 */
                String recalculatedHash =
                        blockchainService.generateHash(
                                block.getIndex()
                                        + block.getPreviousHash()
                                        + block.getData()
                        );

                // Verify current block hash
                if (!block.getHash()
                        .equals(recalculatedHash)) {

                    return false;
                }

                /*
                 * Verify connection with the previous block.
                 */
                if (block.getIndex() > 0) {

                    List<Block> chain =
                            blockchain.getChain();

                    if (block.getIndex() >= chain.size()) {
                        return false;
                    }

                    Block previousBlock =
                            chain.get(block.getIndex() - 1);

                    if (!block.getPreviousHash()
                            .equals(previousBlock.getHash())) {

                        return false;
                    }
                }

                return true;
            }
        }

        /*
         * No blockchain block was found for this order.
         */
        return false;
    }
}