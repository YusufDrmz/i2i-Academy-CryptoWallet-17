package com.i2i.CryptoWallet.auth.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        BigDecimal balance,
        LocalDateTime createdAt
) {}