package com.trustcart.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_blocks")
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "block_index", nullable = false)
    private int blockIndex;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 2048)
    private String data;

    @Column(nullable = false, length = 128)
    private String previousHash;

    @Column(nullable = false, unique = true, length = 128)
    private String hash;

    public Block() {
    }

    public Block(
            int blockIndex,
            LocalDateTime timestamp,
            String data,
            String previousHash,
            String hash) {

        this.blockIndex = blockIndex;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = hash;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getIndex() {
        return blockIndex;
    }

    public void setIndex(int index) {
        this.blockIndex = index;
    }

    public int getBlockIndex() {
        return blockIndex;
    }

    public void setBlockIndex(int blockIndex) {
        this.blockIndex = blockIndex;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }
}