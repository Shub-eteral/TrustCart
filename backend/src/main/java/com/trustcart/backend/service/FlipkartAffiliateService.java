package com.trustcart.backend.service;

import com.trustcart.backend.dto.AffiliateProductDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FlipkartAffiliateService {

    @Value("${flipkart.affiliate.enabled:false}")
    private boolean affiliateEnabled;

    @Value("${flipkart.affiliate.id:}")
    private String affiliateId;

    @Value("${flipkart.affiliate.token:}")
    private String affiliateToken;

    @Value("${flipkart.affiliate.base-url:https://affiliate-api.flipkart.net/affiliate/}")
    private String affiliateBaseUrl;

    // In-memory cache for affiliate searches
    private final Map<String, List<AffiliateProductDTO>> affiliateCache = new ConcurrentHashMap<>();

    public boolean isAffiliateEnabled() {
        return affiliateEnabled && affiliateId != null && !affiliateId.isBlank()
                && affiliateToken != null && !affiliateToken.isBlank();
    }

    public List<AffiliateProductDTO> searchAffiliateProducts(String query) {
        if (!isAffiliateEnabled() || query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        String cacheKey = query.trim().toLowerCase();
        if (affiliateCache.containsKey(cacheKey)) {
            return affiliateCache.get(cacheKey);
        }

        // Architecture ready for official Flipkart Affiliate REST endpoint call
        // E.g. GET {affiliateBaseUrl}/1.0/search.json?query={query}&resultCount=10
        // Headers: Fk-Affiliate-Id, Fk-Affiliate-Token
        // On success: parse JSON and map to List<AffiliateProductDTO>
        // If credentials are placeholder or network fails, return empty list gracefully
        List<AffiliateProductDTO> results = new ArrayList<>();
        affiliateCache.put(cacheKey, results);
        return results;
    }
}
