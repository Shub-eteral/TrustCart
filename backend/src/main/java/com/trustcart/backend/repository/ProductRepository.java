package com.trustcart.backend.repository;

import com.trustcart.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByProductHash(String productHash);

    boolean existsByProductHash(String productHash);

    boolean existsByName(String name);

    List<Product> findByCategoryIgnoreCase(String category);

    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    List<Product> findByFeaturedTrue();

    List<Product> findByTrendingTrue();

    List<Product> findTop10ByOrderByRatingDesc();

    @Query("SELECT p FROM Product p WHERE " +
           "(:query IS NULL OR :query = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR :category = '' OR LOWER(p.category) = LOWER(:category)) AND " +
           "(:brand IS NULL OR :brand = '' OR LOWER(p.brand) = LOWER(:brand)) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minRating IS NULL OR p.rating >= :minRating) AND " +
           "(:availableOnly IS NULL OR :availableOnly = false OR p.stock > 0)")
    Page<Product> searchAndFilterProducts(
            @Param("query") String query,
            @Param("category") String category,
            @Param("brand") String brand,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("minRating") Double minRating,
            @Param("availableOnly") Boolean availableOnly,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.brand FROM Product p WHERE p.brand IS NOT NULL ORDER BY p.brand")
    List<String> findDistinctBrands();

    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findDistinctCategories();

    @Query("SELECT p.category, COUNT(p) FROM Product p GROUP BY p.category ORDER BY p.category")
    List<Object[]> countProductsByCategory();
}
