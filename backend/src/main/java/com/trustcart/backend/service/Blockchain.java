package com.trustcart.backend.service;

import com.trustcart.backend.model.Block;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class Blockchain {

    private final BlockchainService blockchainService;
    private final List<Block> chain = new ArrayList<>();

    public Blockchain(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;

        // Create the Genesis Block
        String genesisHash = blockchainService.calculateBlockHash(
                0,
                "0",
                "Genesis Block"
        );

        Block genesisBlock = new Block(
                0,
                LocalDateTime.now(),
                "Genesis Block",
                "0",
                genesisHash
        );

        chain.add(genesisBlock);
    }

    // Add a new block to the blockchain
    public synchronized Block addBlock(String data) {
        Block previousBlock = chain.get(chain.size() - 1);
        int newIndex = previousBlock.getIndex() + 1;
        String previousHash = previousBlock.getHash();

        String newHash = blockchainService.calculateBlockHash(
                newIndex,
                previousHash,
                data
        );

        Block newBlock = new Block(
                newIndex,
                LocalDateTime.now(),
                data,
                previousHash,
                newHash
        );

        chain.add(newBlock);
        return newBlock;
    }

    // Get the complete blockchain
    public synchronized List<Block> getChain() {
        return Collections.unmodifiableList(new ArrayList<>(chain));
    }

    // Find block by hash
    public synchronized Optional<Block> findBlockByHash(String hash) {
        if (hash == null || hash.isBlank()) {
            return Optional.empty();
        }
        return chain.stream()
                .filter(block -> hash.equalsIgnoreCase(block.getHash()))
                .findFirst();
    }

    // Find block by index
    public synchronized Optional<Block> findBlockByIndex(int index) {
        if (index < 0 || index >= chain.size()) {
            return Optional.empty();
        }
        return Optional.of(chain.get(index));
    }

    // Verify the integrity of the blockchain
    public synchronized boolean isChainValid() {
        for (int i = 1; i < chain.size(); i++) {
            Block currentBlock = chain.get(i);
            Block previousBlock = chain.get(i - 1);

            String recalculatedHash = blockchainService.calculateBlockHash(
                    currentBlock.getIndex(),
                    currentBlock.getPreviousHash(),
                    currentBlock.getData()
            );

            // Check current block hash matches recalculated value
            if (!currentBlock.getHash().equals(recalculatedHash)) {
                return false;
            }

            // Check connection with previous block's hash
            if (!currentBlock.getPreviousHash().equals(previousBlock.getHash())) {
                return false;
            }
        }
        return true;
    }

    // Controlled demo method for presentation testing
    public synchronized boolean tamperBlockForDemo(int index, String tamperedData) {
        if (index <= 0 || index >= chain.size()) {
            return false;
        }
        Block block = chain.get(index);
        block.setData(tamperedData);
        return true;
    }
}
