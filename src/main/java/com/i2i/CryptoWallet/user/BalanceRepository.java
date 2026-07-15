package com.i2i.CryptoWallet.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BalanceRepository extends JpaRepository<Balance, Long> {

    Optional<Balance> findByUserIdAndCurrency(Long userId, String currency);

    List<Balance> findByUserId(Long userId);
}