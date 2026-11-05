package com.trustcart.backend.repository;

import com.trustcart.backend.model.Order;
import com.trustcart.backend.model.OrderItem;
import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);

    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.order.user = :user AND oi.product = :product AND oi.order.status != 'CANCELLED'")
    boolean hasUserPurchasedProduct(@Param("user") User user, @Param("product") Product product);
}
