package com.i2i.CryptoWallet.trading;

import com.i2i.CryptoWallet.auth.AuthenticatedUser;
import com.i2i.CryptoWallet.trading.dto.TradeRequestDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/buy")
    public ResponseEntity<Transaction> buy(@RequestBody @Valid TradeRequestDTO requestDTO, HttpServletRequest request) {
        Long userId = AuthenticatedUser.getUserId(request);
        Transaction transaction = tradingService.buy(userId, requestDTO.getAsset(), requestDTO.getAmount());
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/sell")
    public ResponseEntity<Transaction> sell(@RequestBody @Valid TradeRequestDTO requestDTO, HttpServletRequest request) {
        Long userId = AuthenticatedUser.getUserId(request);
        Transaction transaction = tradingService.sell(userId, requestDTO.getAsset(), requestDTO.getAmount());
        return ResponseEntity.ok(transaction);
    }
}
