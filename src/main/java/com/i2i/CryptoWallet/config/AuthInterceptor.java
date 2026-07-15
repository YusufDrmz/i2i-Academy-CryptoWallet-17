package com.i2i.CryptoWallet.config;

import com.i2i.CryptoWallet.auth.AuthenticatedUser;
import com.i2i.CryptoWallet.auth.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;

public class AuthInterceptor implements HandlerInterceptor {

    private final SessionService sessionService;

    public AuthInterceptor(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String header = request.getHeader("Authorization");
        String token = (header != null && header.startsWith("Bearer ")) ? header.substring(7) : null;

        Optional<Long> userId = sessionService.validateSession(token);
        if (userId.isEmpty()) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"Missing, invalid or expired session token\"}");
            return false;
        }

        request.setAttribute(AuthenticatedUser.REQUEST_ATTRIBUTE, userId.get());
        return true;
    }
}