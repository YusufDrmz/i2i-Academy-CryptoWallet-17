package com.i2i.CryptoWallet.market;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final ExternalDataProvider dataProvider;
    private final PriceHistoryRepository priceHistoryRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String REDIS_PRICE_PREFIX = "price:";

    // Runs every 15 seconds
    @Scheduled(fixedRate = 15000)
    public void fetchAndStorePrices() {
        Map<String, BigDecimal> prices = dataProvider.fetchLatestPrices();
        
        for (Map.Entry<String, BigDecimal> entry : prices.entrySet()) {
            String asset = entry.getKey();
            BigDecimal price = entry.getValue();
            
            // 1. Write to Redis (instant overwrite)
            redisTemplate.opsForValue().set(REDIS_PRICE_PREFIX + asset, price.toPlainString());
            
            // 2. Write to PostgreSQL for historical trend logging
            PriceHistory history = new PriceHistory();
            history.setAsset(asset);
            history.setPrice(price);
            priceHistoryRepository.save(history);
        }
    }

    public Map<String, BigDecimal> getLatestPrices() {
        Map<String, BigDecimal> prices = new HashMap<>();
        Set<String> keys = redisTemplate.keys(REDIS_PRICE_PREFIX + "*");
        if (keys != null) {
            for (String key : keys) {
                String asset = key.substring(REDIS_PRICE_PREFIX.length());
                String priceStr = redisTemplate.opsForValue().get(key);
                if (priceStr != null) {
                    prices.put(asset, new BigDecimal(priceStr));
                }
            }
        }
        return prices;
    }
    
    public BigDecimal getPrice(String asset) {
        String priceStr = redisTemplate.opsForValue().get(REDIS_PRICE_PREFIX + asset);
        if (priceStr == null) {
            throw new IllegalArgumentException("Price not found for asset: " + asset);
        }
        return new BigDecimal(priceStr);
    }
}
