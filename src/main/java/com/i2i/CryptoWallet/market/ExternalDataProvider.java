package com.i2i.CryptoWallet.market;

import java.math.BigDecimal;
import java.util.Map;

public interface ExternalDataProvider {
    Map<String, BigDecimal> fetchLatestPrices();
}
