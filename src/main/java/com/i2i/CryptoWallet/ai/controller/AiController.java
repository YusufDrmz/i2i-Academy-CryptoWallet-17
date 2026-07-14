package com.i2i.CryptoWallet.ai.controller;

import com.i2i.CryptoWallet.ai.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Handle user query and return AI response
    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> query(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");

        if (userQuery == null || userQuery.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }

        // Build prompt with context
        String prompt = """
                You are a cryptocurrency trading assistant for CryptoWallet.
                Answer only questions about cryptocurrency markets, trading, and portfolio management.
                User question: %s
                """.formatted(userQuery);

        String response = geminiService.askGemini(prompt);
        return ResponseEntity.ok(Map.of("response", response));
    }
}