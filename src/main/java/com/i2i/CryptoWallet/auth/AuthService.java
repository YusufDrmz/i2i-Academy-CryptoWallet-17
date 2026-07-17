package com.i2i.CryptoWallet.auth;

import com.i2i.CryptoWallet.auth.dto.AuthResponse;
import com.i2i.CryptoWallet.auth.dto.LoginRequest;
import com.i2i.CryptoWallet.auth.dto.RegisterRequest;
import com.i2i.CryptoWallet.auth.dto.UserResponse;
import com.i2i.CryptoWallet.common.exception.ApiException;
import com.i2i.CryptoWallet.user.Balance;
import com.i2i.CryptoWallet.user.BalanceRepository;
import com.i2i.CryptoWallet.user.User;
import com.i2i.CryptoWallet.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.List;

@Service
public class AuthService {

    private static final String FIAT_CURRENCY = "USD";
    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid username or password";

    private final UserRepository userRepository;
    private final BalanceRepository balanceRepository;
    private final SessionService sessionService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private final BigDecimal initialBalanceMin;
    private final BigDecimal initialBalanceMax;

    public List<Balance> getBalances(Long userId) {
        return balanceRepository.findByUserId(userId);
    }

    public UserResponse getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal balance = balanceRepository.findByUserIdAndCurrency(userId, FIAT_CURRENCY)
                .map(Balance::getAmount)
                .orElse(BigDecimal.ZERO);

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                balance, user.getCreatedAt());
    }

    public AuthService(UserRepository userRepository,
                        BalanceRepository balanceRepository,
                        SessionService sessionService,
                        @Value("${app.initial-balance.min:1000}") BigDecimal initialBalanceMin,
                        @Value("${app.initial-balance.max:10000}") BigDecimal initialBalanceMax) {
        this.userRepository = userRepository;
        this.balanceRepository = balanceRepository;
        this.sessionService = sessionService;
        this.initialBalanceMin = initialBalanceMin;
        this.initialBalanceMax = initialBalanceMax;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        BigDecimal startingBalance = randomStartingBalance();
        Balance balance = new Balance();
        balance.setUser(user);
        balance.setCurrency(FIAT_CURRENCY);
        balance.setAmount(startingBalance);
        balanceRepository.save(balance);

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(),
                startingBalance, user.getCreatedAt());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
        }

        String token = sessionService.createSession(user.getId());
        return new AuthResponse(token, user.getId(), user.getUsername(), sessionService.getTtlSeconds());
    }

    public void logout(String token) {
        sessionService.invalidateSession(token);
    }

    private BigDecimal randomStartingBalance() {
        double random = ThreadLocalRandom.current().nextDouble(
                initialBalanceMin.doubleValue(), initialBalanceMax.doubleValue());
        return BigDecimal.valueOf(random).setScale(2, RoundingMode.HALF_UP);
    }
}