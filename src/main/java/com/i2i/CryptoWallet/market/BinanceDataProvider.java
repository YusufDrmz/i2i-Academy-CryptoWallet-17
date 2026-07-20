package com.i2i.CryptoWallet.market;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Component
@Profile("live")
public class BinanceDataProvider implements ExternalDataProvider {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Supported assets and their Binance symbol mapping
    private static final Map<String, String> SYMBOL_MAP = Map.of(
            "BTC", "BTCUSDT",
            "ETH", "ETHUSDT",
            "SOL", "SOLUSDT",
            "BNB", "BNBUSDT",
            "ADA", "ADAUSDT",
            "XRP", "XRPUSDT",
            "DOGE", "DOGEUSDT",
            "DOT", "DOTUSDT",
            "AVAX", "AVAXUSDT",
            "MATIC", "MATICUSDT"
    );

    @Override
    public Map<String, BigDecimal> fetchLatestPrices() {
        Map<String, BigDecimal> prices = new HashMap<>();
        try {
            // Build symbols array for Binance batch endpoint
            String symbols = "[\"" + String.join("\",\"", SYMBOL_MAP.values()) + "\"]";
            String url = "https://api.binance.com/api/v3/ticker/price?symbols=" +
                    java.net.URLEncoder.encode(symbols, java.nio.charset.StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // Parse response array
            JsonNode root = objectMapper.readTree(response.body());
            if (root.isArray()) {
                // Reverse map: BTCUSDT -> BTC
                Map<String, String> reverseMap = new HashMap<>();
                SYMBOL_MAP.forEach((asset, symbol) -> reverseMap.put(symbol, asset));

                for (JsonNode node : root) {
                    String symbol = node.get("symbol").asText();
                    String asset = reverseMap.get(symbol);
                    if (asset != null) {
                        prices.put(asset, new BigDecimal(node.get("price").asText()));
                    }
                }
            }
        } catch (Exception e) {
            // Return empty map on error — MarketDataService will handle it
            System.err.println("Binance API error: " + e.getMessage());
        }
        return prices;
    }
}