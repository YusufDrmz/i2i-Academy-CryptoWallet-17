package com.i2i.CryptoWallet.auth;

import com.i2i.CryptoWallet.common.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

public final class AuthenticatedUser {

    public static final String REQUEST_ATTRIBUTE = "userId";

    private AuthenticatedUser() {
    }

    public static Long getUserId(HttpServletRequest request) {
        Object userId = request.getAttribute(REQUEST_ATTRIBUTE);
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "No authenticated user on this request");
        }
        return (Long) userId;
    }
}