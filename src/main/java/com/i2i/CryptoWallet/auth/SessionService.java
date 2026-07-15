package com.i2i.CryptoWallet.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionService {

    private static final String KEY_PREFIX = "session:";

    private final StringRedisTemplate redisTemplate;
    private final long ttlSeconds;

    public SessionService(StringRedisTemplate redisTemplate,
                           @Value("${session.token.ttl-seconds:1800}") long ttlSeconds) {
        this.redisTemplate = redisTemplate;
        this.ttlSeconds = ttlSeconds;
    }

    public String createSession(Long userId) {
        String token = UUID.randomUUID().toString();
        String key = KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, String.valueOf(userId), Duration.ofSeconds(ttlSeconds));
        return token;
    }

    public Optional<Long> validateSession(String token) {
        String key = KEY_PREFIX + token;
        String userId = redisTemplate.opsForValue().get(key);
        if (userId == null) {
            return Optional.empty();
        }
        redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
        return Optional.of(Long.parseLong(userId));
    }

    public void invalidateSession(String token) {
        redisTemplate.delete(KEY_PREFIX + token);
    }

    public long getTtlSeconds() {
        return ttlSeconds;
    }
}