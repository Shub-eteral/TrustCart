package com.trustcart.backend.service;

import com.trustcart.backend.model.Block;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class Blockchain {

    private final BlockchainService blockchainService;
    private final List<Block> chain = new ArrayList<>();

    public Blockchain(BlockchainService blockchainService) {
        this.blockchainService = blockchainService;

        // Create the Genesis Block
        String genesisHash = blockchainService.generateHash(
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
    public Block addBlock(String data) {

        Block previousBlock =
                chain.get(chain.size() - 1);

        int newIndex = previousBlock.getIndex() + 1;

        String previousHash =
                previousBlock.getHash();

        String hashData =
                newIndex
                        + previousHash
                        + data;

        String newHash =
                blockchainService.generateHash(hashData);

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
    public List<Block> getChain() {
        return chain;
    }

    // Verify the integrity of the blockchain
    public boolean isChainValid() {

        for (int i = 1; i < chain.size(); i++) {

            Block currentBlock = chain.get(i);
            Block previousBlock = chain.get(i - 1);

            String recalculatedHash =
                    blockchainService.generateHash(
                            currentBlock.getIndex()
                                    + currentBlock.getPreviousHash()
                                    + currentBlock.getData()
                    );

            // Check current block hash
            if (!currentBlock.getHash()
                    .equals(recalculatedHash)) {

                return false;
            }

            // Check connection with previous block
            if (!currentBlock.getPreviousHash()
                    .equals(previousBlock.getHash())) {

                return false;
            }
        }

        return true;
    }
}