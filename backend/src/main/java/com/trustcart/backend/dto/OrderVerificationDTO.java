package com.trustcart.backend.dto;

public class OrderVerificationDTO {

    private Long orderId;
    private boolean valid;
    private String message;
    private String blockchainHash;
    private String calculatedHash;
    private Integer blockIndex;
    private String previousHash;
    private boolean chainValid;
    private String timestamp;

    public OrderVerificationDTO() {
    }

    public OrderVerificationDTO(
            Long orderId,
            boolean valid,
            String message,
            String blockchainHash,
            String calculatedHash,
            Integer blockIndex,
            String previousHash,
            boolean chainValid,
            String timestamp) {
        this.orderId = orderId;
        this.valid = valid;
        this.message = message;
        this.blockchainHash = blockchainHash;
        this.calculatedHash = calculatedHash;
        this.blockIndex = blockIndex;
        this.previousHash = previousHash;
        this.chainValid = chainValid;
        this.timestamp = timestamp;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getBlockchainHash() {
        return blockchainHash;
    }

    public void setBlockchainHash(String blockchainHash) {
        this.blockchainHash = blockchainHash;
    }

    public String getCalculatedHash() {
        return calculatedHash;
    }

    public void setCalculatedHash(String calculatedHash) {
        this.calculatedHash = calculatedHash;
    }

    public Integer getBlockIndex() {
        return blockIndex;
    }

    public void setBlockIndex(Integer blockIndex) {
        this.blockIndex = blockIndex;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public boolean isChainValid() {
        return chainValid;
    }

    public void setChainValid(boolean chainValid) {
        this.chainValid = chainValid;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
