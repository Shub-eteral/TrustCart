package com.trustcart.backend.repository;

import com.trustcart.backend.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {

    Optional<Block> findByHash(String hash);

    List<Block> findAllByOrderByBlockIndexAsc();

    Optional<Block> findTopByOrderByBlockIndexDesc();
}
