package com.i2i.CryptoWallet.ai.controller;

import com.i2i.CryptoWallet.ai.service.GeminiService;
import com.i2i.CryptoWallet.auth.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Handle user query and return AI response with user context
    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> query(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        String userQuery = request.get("query");

        if (userQuery == null || userQuery.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }

        // Get userId from session if available
        Long userId = null;
        try {
            userId = AuthenticatedUser.getUserId(httpRequest);
        } catch (Exception e) {
            // Continue without user context if not authenticated
        }

        String response = geminiService.askGemini(userQuery, userId);
        return ResponseEntity.ok(Map.of("response", response));
    }
}