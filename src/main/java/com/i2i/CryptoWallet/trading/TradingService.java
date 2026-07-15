package com.i2i.CryptoWallet.trading;

import com.i2i.CryptoWallet.common.exception.ApiException;
import com.i2i.CryptoWallet.market.MarketDataService;
import com.i2i.CryptoWallet.user.Balance;
import com.i2i.CryptoWallet.user.BalanceRepository;
import com.i2i.CryptoWallet.user.User;
import com.i2i.CryptoWallet.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class TradingService {

    private final UserRepository userRepository;
    private final BalanceRepository balanceRepository;
    private final TransactionRepository transactionRepository;
    private final MarketDataService marketDataService;

    private static final String FIAT_CURRENCY = "USD";

    @Transactional
    public Transaction buy(Long userId, String asset, BigDecimal amountToBuy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal currentPrice = marketDataService.getPrice(asset);
        BigDecimal totalCost = amountToBuy.multiply(currentPrice);

        Balance fiatBalance = balanceRepository.findByUserIdAndCurrency(userId, FIAT_CURRENCY)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fiat balance not found"));

        if (fiatBalance.getAmount().compareTo(totalCost) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient funds to complete this trade");
        }

        fiatBalance.setAmount(fiatBalance.getAmount().subtract(totalCost));
        balanceRepository.save(fiatBalance);

        Balance cryptoBalance = balanceRepository.findByUserIdAndCurrency(userId, asset)
                .orElseGet(() -> {
                    Balance newBalance = new Balance();
                    newBalance.setUser(user);
                    newBalance.setCurrency(asset);
                    newBalance.setAmount(BigDecimal.ZERO);
                    return newBalance;
                });
        
        cryptoBalance.setAmount(cryptoBalance.getAmount().add(amountToBuy));
        balanceRepository.save(cryptoBalance);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType("BUY");
        transaction.setAsset(asset);
        transaction.setAmount(amountToBuy);
        transaction.setPrice(currentPrice);
        transaction.setTotal(totalCost);
        
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction sell(Long userId, String asset, BigDecimal amountToSell) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal currentPrice = marketDataService.getPrice(asset);
        BigDecimal totalValue = amountToSell.multiply(currentPrice);

        Balance cryptoBalance = balanceRepository.findByUserIdAndCurrency(userId, asset)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Crypto balance not found"));

        if (cryptoBalance.getAmount().compareTo(amountToSell) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Insufficient crypto balance to complete this trade");
        }

        cryptoBalance.setAmount(cryptoBalance.getAmount().subtract(amountToSell));
        balanceRepository.save(cryptoBalance);

        Balance fiatBalance = balanceRepository.findByUserIdAndCurrency(userId, FIAT_CURRENCY)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Fiat balance not found"));
        
        fiatBalance.setAmount(fiatBalance.getAmount().add(totalValue));
        balanceRepository.save(fiatBalance);

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType("SELL");
        transaction.setAsset(asset);
        transaction.setAmount(amountToSell);
        transaction.setPrice(currentPrice);
        transaction.setTotal(totalValue);
        
        return transactionRepository.save(transaction);
    }
}
