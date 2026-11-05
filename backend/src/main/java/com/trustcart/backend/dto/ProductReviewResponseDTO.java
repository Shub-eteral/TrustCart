package com.trustcart.backend.dto;

import java.time.LocalDateTime;

public class ProductReviewResponseDTO {

    private Long id;
    private Long productId;
    private String userName;
    private String userEmail;
    private int rating;
    private String headline;
    private String comment;
    private boolean verifiedPurchase;
    private LocalDateTime createdAt;

    public ProductReviewResponseDTO() {
    }

    public ProductReviewResponseDTO(Long id, Long productId, String userName, String userEmail,
                                    int rating, String headline, String comment,
                                    boolean verifiedPurchase, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.rating = rating;
        this.headline = headline;
        this.comment = comment;
        this.verifiedPurchase = verifiedPurchase;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public boolean isVerifiedPurchase() {
        return verifiedPurchase;
    }

    public void setVerifiedPurchase(boolean verifiedPurchase) {
        this.verifiedPurchase = verifiedPurchase;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
