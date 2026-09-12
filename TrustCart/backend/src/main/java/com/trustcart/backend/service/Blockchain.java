package com.trustcart.backend.service;

import com.trustcart.backend.model.Block;
import com.trustcart.backend.repository.BlockRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class Blockchain {

    private final BlockchainService blockchainService;
    private final BlockRepository blockRepository;

    public Blockchain(BlockchainService blockchainService, BlockRepository blockRepository) {
        this.blockchainService = blockchainService;
        this.blockRepository = blockRepository;
    }

    // Ensure genesis block is persisted in the database
    @PostConstruct
    public synchronized void initChain() {
        if (blockRepository.count() == 0) {
            String genesisHash = blockchainService.generateHash("Genesis Block");

            Block genesisBlock = new Block(
                    0,
                    LocalDateTime.now(),
                    "Genesis Block",
                    "0",
                    genesisHash
            );

            blockRepository.save(genesisBlock);
        }
    }

    // Add a new block to the persistent blockchain
    @Transactional
    public synchronized Block addBlock(String data) {

        Block previousBlock = blockRepository.findTopByOrderByBlockIndexDesc()
                .orElseGet(() -> {
                    initChain();
                    return blockRepository.findTopByOrderByBlockIndexDesc()
                            .orElseThrow(() -> new IllegalStateException("Failed to initialize genesis block"));
                });

        int newIndex = previousBlock.getIndex() + 1;
        String previousHash = previousBlock.getHash();

        String hashData = newIndex + previousHash + data;
        String newHash = blockchainService.generateHash(hashData);

        Block newBlock = new Block(
                newIndex,
                LocalDateTime.now(),
                data,
                previousHash,
                newHash
        );

        return blockRepository.save(newBlock);
    }

    // Get the complete blockchain ordered by index from PostgreSQL
    public List<Block> getChain() {
        return blockRepository.findAllByOrderByBlockIndexAsc();
    }

    // Verify the cryptographic integrity of the entire blockchain
    public boolean isChainValid() {
        List<Block> chain = blockRepository.findAllByOrderByBlockIndexAsc();

        if (chain.isEmpty()) {
            return false;
        }

        // Validate Genesis block
        Block genesisBlock = chain.get(0);
        String genesisExpectedHash = blockchainService.generateHash("Genesis Block");
        if (!genesisBlock.getHash().equals(genesisExpectedHash)) {
            return false;
        }

        // Validate subsequent blocks
        for (int i = 1; i < chain.size(); i++) {
            Block currentBlock = chain.get(i);
            Block previousBlock = chain.get(i - 1);

            String recalculatedHash = blockchainService.generateHash(
                    currentBlock.getIndex()
                            + currentBlock.getPreviousHash()
                            + currentBlock.getData()
            );

            // Check current block hash
            if (!currentBlock.getHash().equals(recalculatedHash)) {
                return false;
            }

            // Check connection with previous block
            if (!currentBlock.getPreviousHash().equals(previousBlock.getHash())) {
                return false;
            }
        }

        return true;
    }
}