# CryptoPal — i2i Academy Final Project

A crypto trading platform built as a modular Spring Boot backend, combining real-time market data, wallet management, and AI-powered market insights via Google Gemini.

## Architecture

- **CryptoPal Web App** — React SPA frontend (`cryptowallet-frontend/`)
- **CryptoPal Core** — Spring Boot backend, modular monolith (auth, market data, trading, AI)
- **PostgreSQL** — persistent storage for users, balances, transactions, price history
- **Redis** — session token caching and live price caching
- **Google Gemini** — AI-powered market analytics and chat

## Prerequisites

- JDK 21
- Docker & Docker Compose
- Node.js (for the frontend)

## Setup

1. Clone the repo and copy the environment template:
```bash
   git clone https://github.com/YusufDrmz/i2i-Academy-CryptoWallet-17.git
   cd i2i-Academy-CryptoWallet-17
   cp .env.example .env
```
2. Fill in `.env` with your own values (database credentials, Gemini API key, etc.)
3. Start Postgres and Redis:
```bash
   docker compose up -d
```
4. Run the backend:
```bash
   ./mvnw spring-boot:run
```
