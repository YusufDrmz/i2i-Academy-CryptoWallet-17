package com.i2i.CryptoWallet.market;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class TickerEngine implements ExternalDataProvider {

    private final Map<String, BigDecimal> currentPrices = new HashMap<>();
    private final Random random = new Random();

    public TickerEngine() {
        // Initial mock prices
        currentPrices.put("BTC", new BigDecimal("60000.00000000"));
        currentPrices.put("ETH", new BigDecimal("3000.00000000"));
        currentPrices.put("SOL", new BigDecimal("150.00000000"));
    }

    @Override
    public Map<String, BigDecimal> fetchLatestPrices() {
        for (String asset : currentPrices.keySet()) {
            BigDecimal currentPrice = currentPrices.get(asset);
            // Random fluctuation between -1% and +1%
            double fluctuation = -0.01 + (0.02 * random.nextDouble());
            BigDecimal change = currentPrice.multiply(BigDecimal.valueOf(fluctuation));
            BigDecimal newPrice = currentPrice.add(change).setScale(8, RoundingMode.HALF_UP);
            
            // Prevent prices from going negative or zero
            if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
                newPrice = new BigDecimal("1.00000000");
            }
            currentPrices.put(asset, newPrice);
        }
        return new HashMap<>(currentPrices);
    }
}
