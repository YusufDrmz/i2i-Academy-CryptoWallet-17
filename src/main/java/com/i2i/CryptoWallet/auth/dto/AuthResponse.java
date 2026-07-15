package com.i2i.CryptoWallet.auth.dto;

public record AuthResponse(
    String token,
    Long userId,
    String username,
    long expiresInSeconds
) {}