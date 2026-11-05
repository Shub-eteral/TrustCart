package com.trustcart.backend.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class BlockchainService {

    // Generate a SHA-256 hash for blockchain verification using Java MessageDigest
    public String generateHash(String data) {
        if (data == null) {
            data = "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    // Generate consistent, canonical transaction data for an order
    public String createTransactionData(Long orderId, String customerEmail, double totalAmount, LocalDateTime orderDate) {
        return "ORDER_ID=" + orderId
                + "|USER=" + customerEmail
                + "|TOTAL=" + String.format(Locale.US, "%.2f", totalAmount)
                + "|DATE=" + orderDate;
    }

    // Compute consistent hash for a block using index, previousHash, and transaction data
    public String calculateBlockHash(int index, String previousHash, String data) {
        return generateHash(index + previousHash + data);
    }
}
