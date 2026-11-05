package com.trustcart.backend.repository;

import com.trustcart.backend.model.Product;
import com.trustcart.backend.model.ProductReview;
import com.trustcart.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    List<ProductReview> findByProductOrderByCreatedAtDesc(Product product);

    boolean existsByProductAndUser(Product product, User user);

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product = :product")
    Double getAverageRatingForProduct(@Param("product") Product product);

    @Query("SELECT COUNT(r) FROM ProductReview r WHERE r.product = :product")
    Long getReviewCountForProduct(@Param("product") Product product);
}
