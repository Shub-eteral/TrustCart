package com.trustcart.backend.service;

import com.trustcart.backend.model.Block;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class BlockchainServiceTest {

    private BlockchainService blockchainService;
    private Blockchain blockchain;

    @BeforeEach
    void setUp() {
        blockchainService = new BlockchainService();
        blockchain = new Blockchain(blockchainService);
    }

    @Test
    void testGenerateHashSHA256() {
        String hash1 = blockchainService.generateHash("TrustCart-Block-1");
        assertNotNull(hash1);
        assertEquals(64, hash1.length(), "SHA-256 hex string must be exactly 64 characters");

        // Deterministic hash check
        String hash2 = blockchainService.generateHash("TrustCart-Block-1");
        assertEquals(hash1, hash2, "Hashing the same input must yield identical output");

        // Avalanche effect check
        String hash3 = blockchainService.generateHash("TrustCart-Block-2");
        assertNotEquals(hash1, hash3, "Different input must yield completely different hash");
    }

    @Test
    void testGenesisBlockCreation() {
        assertNotNull(blockchain.getChain());
        assertFalse(blockchain.getChain().isEmpty());

        Block genesis = blockchain.getChain().get(0);
        assertEquals(0, genesis.getIndex());
        assertEquals("0", genesis.getPreviousHash());
        assertEquals("Genesis Block", genesis.getData());
        assertNotNull(genesis.getHash());
        assertTrue(blockchain.isChainValid());
    }

    @Test
    void testAddBlocksAndLinking() {
        String tx1 = "ORDER_ID=101|USER=alice@example.com|TOTAL=1299.00|DATE=2026-11-04T12:00:00";
        Block block1 = blockchain.addBlock(tx1);

        assertEquals(1, block1.getIndex());
        assertEquals(blockchain.getChain().get(0).getHash(), block1.getPreviousHash());
        assertEquals(tx1, block1.getData());
        assertTrue(blockchain.isChainValid());

        String tx2 = "ORDER_ID=102|USER=bob@example.com|TOTAL=4599.00|DATE=2026-11-04T12:05:00";
        Block block2 = blockchain.addBlock(tx2);

        assertEquals(2, block2.getIndex());
        assertEquals(block1.getHash(), block2.getPreviousHash());
        assertEquals(3, blockchain.getChain().size());
        assertTrue(blockchain.isChainValid());
    }

    @Test
    void testTamperDetectionOnBlockData() {
        blockchain.addBlock("ORDER_ID=201|USER=charlie@test.com|TOTAL=500.00|DATE=2026-11-04T12:10:00");
        assertTrue(blockchain.isChainValid());

        // Tamper block 1 data
        blockchain.tamperBlockForDemo(1, "ORDER_ID=201|USER=charlie@test.com|TOTAL=99999.00|DATE=2026-11-04T12:10:00");

        // Chain validation should immediately catch tampered block!
        assertFalse(blockchain.isChainValid(), "Tampered block data must cause isChainValid() to return false");
    }
}
