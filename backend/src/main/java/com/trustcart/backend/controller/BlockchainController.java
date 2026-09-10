package com.trustcart.backend.controller;

import com.trustcart.backend.model.Block;
import com.trustcart.backend.service.Blockchain;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blockchain")
public class BlockchainController {

    private final Blockchain blockchain;

    public BlockchainController(Blockchain blockchain) {
        this.blockchain = blockchain;
    }

    // Add a new block
    @PostMapping("/add")
    public ResponseEntity<Block> addBlock(
            @RequestBody String data) {

        Block block = blockchain.addBlock(data);

        return ResponseEntity.ok(block);
    }

    // Get complete blockchain
    @GetMapping
    public ResponseEntity<List<Block>> getBlockchain() {

        return ResponseEntity.ok(
                blockchain.getChain()
        );
    }

    // Verify blockchain integrity
    @GetMapping("/verify")
    public ResponseEntity<String> verifyBlockchain() {

        boolean valid = blockchain.isChainValid();

        if (valid) {
            return ResponseEntity.ok(
                    "Blockchain is valid"
            );
        }

        return ResponseEntity.ok(
                "Blockchain has been tampered with"
        );
    }
}