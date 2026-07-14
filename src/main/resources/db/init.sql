-- Users table
CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Balances table
CREATE TABLE IF NOT EXISTS balances (
                                        id BIGSERIAL PRIMARY KEY,
                                        user_id BIGINT NOT NULL REFERENCES users(id),
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL DEFAULT 0,
    UNIQUE(user_id, currency)
    );

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
                                            id BIGSERIAL PRIMARY KEY,
                                            user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(10) NOT NULL,
    asset VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    total DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
                                             id BIGSERIAL PRIMARY KEY,
                                             asset VARCHAR(10) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );