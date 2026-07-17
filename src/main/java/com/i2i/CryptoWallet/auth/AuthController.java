package com.i2i.CryptoWallet.auth;

import com.i2i.CryptoWallet.auth.dto.AuthResponse;
import com.i2i.CryptoWallet.auth.dto.LoginRequest;
import com.i2i.CryptoWallet.auth.dto.RegisterRequest;
import com.i2i.CryptoWallet.auth.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import com.i2i.CryptoWallet.user.Balance;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(HttpServletRequest request) {
        Long userId = AuthenticatedUser.getUserId(request);
        return ResponseEntity.ok(authService.getUser(userId));
    }
    @GetMapping("/balances")
    public ResponseEntity<List<Balance>> balances(HttpServletRequest request) {
        Long userId = AuthenticatedUser.getUserId(request);
        return ResponseEntity.ok(authService.getBalances(userId));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        String token = (authorizationHeader != null && authorizationHeader.startsWith("Bearer "))
                ? authorizationHeader.substring(7)
                : null;
        authService.logout(token);
        return ResponseEntity.noContent().build();
}
}