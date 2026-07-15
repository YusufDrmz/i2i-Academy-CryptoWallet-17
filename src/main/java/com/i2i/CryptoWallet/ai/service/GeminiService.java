package com.i2i.CryptoWallet.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.i2i.CryptoWallet.user.Balance;
import com.i2i.CryptoWallet.user.BalanceRepository;
import com.i2i.CryptoWallet.user.User;
import com.i2i.CryptoWallet.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Optional;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .followRedirects(HttpClient.Redirect.ALWAYS)
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserRepository userRepository;
    private final BalanceRepository balanceRepository;

    public GeminiService(UserRepository userRepository, BalanceRepository balanceRepository) {
        this.userRepository = userRepository;
        this.balanceRepository = balanceRepository;
    }

    // Build context from user data and send to Gemini
    public String askGemini(String userQuery, Long userId) {
        try {
            // Enrich prompt with user context
            String context = buildUserContext(userId);

            String prompt = """
                    You are a cryptocurrency trading assistant for CryptoWallet.
                    Answer only questions about cryptocurrency markets, trading, and portfolio management.
                    
                    User context:
                    %s
                    
                    User question: %s
                    """.formatted(context, userQuery);

            return callGeminiApi(prompt);

        } catch (Exception e) {
            return "AI service is currently unavailable. Please try again later.";
        }
    }

    // Gather user account details for context enrichment
    private String buildUserContext(Long userId) {
        if (userId == null) {
            return "No user context available.";
        }

        StringBuilder context = new StringBuilder();

        // Add user info
        Optional<User> userOpt = userRepository.findById(userId);
        userOpt.ifPresent(user -> {
            context.append("Username: ").append(user.getUsername()).append("\n");
            context.append("Member since: ").append(user.getCreatedAt()).append("\n");
        });

        // Add balance info
        List<Balance> balances = balanceRepository.findByUserId(userId);
        if (!balances.isEmpty()) {
            context.append("Portfolio balances:\n");
            balances.forEach(balance ->
                    context.append("- ").append(balance.getCurrency())
                            .append(": ").append(balance.getAmount()).append("\n")
            );
        }

        return context.toString();
    }

    // Send prompt to Gemini API and return response
    private String callGeminiApi(String prompt) throws Exception {
        String url = apiUrl + "?key=" + apiKey;

        String requestBody = """
                {
                    "contents": [{
                        "parts": [{
                            "text": "%s"
                        }]
                    }]
                }
                """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        // Parse response using Jackson
        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");

        if (candidates.isArray() && candidates.size() > 0) {
            return candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
        }

        return "Unexpected response from AI service.";
    }
}