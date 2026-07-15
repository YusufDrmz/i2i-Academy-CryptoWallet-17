package com.i2i.CryptoWallet.trading.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TradeRequestDTO {
    @NotBlank
    private String asset;

    @NotNull
    @DecimalMin(value = "0.00000001")
    private BigDecimal amount;
}
