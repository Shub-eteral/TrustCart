package com.trustcart.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private double price; // Selling price

    @Column
    private Double originalPrice; // MRP / Original price

    @Column
    private Integer discountPercentage;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private String category;

    @Column
    private String brand;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(length = 2000)
    private String additionalImages; // Comma-separated or JSON list of image URLs

    @Column
    private Double rating = 4.5;

    @Column
    private Integer reviewCount = 120;

    @Column
    private Boolean available = true;

    @Column(length = 2000)
    private String specifications;

    @Column
    private Boolean featured = false;

    @Column
    private Boolean trending = false;

    // Blockchain-related identifier
    @Column(unique = true, nullable = false)
    private String productHash;

    public Product() {
    }

    public Product(String name, String description, double price,
                   int stock, String category, String productHash) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.originalPrice = (double) Math.round(price * 1.25);
        this.discountPercentage = 20;
        this.stock = stock;
        this.category = category;
        this.productHash = productHash;
        this.available = stock > 0;
        this.rating = 4.5;
        this.reviewCount = 95;
    }

    public Product(String name, String brand, String category, String description,
                   double price, Double originalPrice, int stock, String imageUrl,
                   String additionalImages, double rating, int reviewCount,
                   String specifications, boolean featured, boolean trending, String productHash) {
        this.name = name;
        this.brand = brand;
        this.category = category;
        this.description = description;
        this.price = price;
        this.originalPrice = originalPrice != null ? originalPrice : (double) Math.round(price * 1.2);
        if (this.originalPrice > price) {
            this.discountPercentage = (int) Math.round(((this.originalPrice - price) / this.originalPrice) * 100);
        } else {
            this.discountPercentage = 0;
        }
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.additionalImages = additionalImages;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.available = stock > 0;
        this.specifications = specifications;
        this.featured = featured;
        this.trending = trending;
        this.productHash = productHash;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
        if (this.originalPrice != null && this.originalPrice > price) {
            this.discountPercentage = (int) Math.round(((this.originalPrice - price) / this.originalPrice) * 100);
        }
    }

    public Double getOriginalPrice() {
        return originalPrice != null ? originalPrice : price;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
        if (originalPrice != null && originalPrice > this.price) {
            this.discountPercentage = (int) Math.round(((originalPrice - this.price) / originalPrice) * 100);
        }
    }

    public Integer getDiscountPercentage() {
        if (discountPercentage == null && originalPrice != null && originalPrice > price) {
            return (int) Math.round(((originalPrice - price) / originalPrice) * 100);
        }
        return discountPercentage != null ? discountPercentage : 0;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
        this.available = stock > 0;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand != null ? brand : "TrustCart";
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAdditionalImages() {
        return additionalImages;
    }

    public void setAdditionalImages(String additionalImages) {
        this.additionalImages = additionalImages;
    }

    public Double getRating() {
        return rating != null ? rating : 4.5;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount != null ? reviewCount : 0;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Boolean isAvailable() {
        return (available == null || available) && stock > 0;
    }

    public Boolean getAvailable() {
        return (available == null || available) && stock > 0;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public Boolean isFeatured() {
        return Boolean.TRUE.equals(featured);
    }

    public Boolean getFeatured() {
        return Boolean.TRUE.equals(featured);
    }

    public void setFeatured(Boolean featured) {
        this.featured = featured;
    }

    public Boolean isTrending() {
        return Boolean.TRUE.equals(trending);
    }

    public Boolean getTrending() {
        return Boolean.TRUE.equals(trending);
    }

    public void setTrending(Boolean trending) {
        this.trending = trending;
    }

    public String getProductHash() {
        return productHash;
    }

    public void setProductHash(String productHash) {
        this.productHash = productHash;
    }
}
