# CryptoWallet — i2i Academy Final Project

A full-stack enterprise cryptocurrency trading platform built with Spring Boot, Redis, PostgreSQL, and Google Gemini AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 4.0.7, Java 21 |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| AI | Google Gemini Flash |
| Frontend | React 19, Vite, Tailwind CSS |
| Containerization | Docker, Docker Compose |
| API Docs | Swagger / OpenAPI 3 |

---

## Architecture Overview

```
React SPA (port 5173)
      ↕ REST API
Spring Boot Core (port 8080)
      ↕              ↕              ↕
   Redis 7      PostgreSQL 15   Google Gemini
  (cache)        (persistent)     (AI layer)
      ↑
Ticker Engine (background thread, 15s interval)
```

### Modules

- **Auth Module** — User registration, login, session management via Redis
- **Market Data Module** — Ticker Engine generates prices every 15 seconds, caches in Redis, persists to PostgreSQL
- **Trading Module** — Buy/sell operations with ACID transactional integrity
- **AI Insights Module** — Google Gemini integration with full context enrichment (balances, transactions, live prices)

---

## Prerequisites

Make sure the following are installed:

| Tool | Version | Check |
|---|---|---|
| Java | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Docker Desktop | Latest | `docker -v` |
| Node.js | 18+ | `node -v` |
| Git | Latest | `git --version` |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YusufDrmz/i2i-Academy-CryptoWallet-17.git
cd i2i-Academy-CryptoWallet-17
```

### 2. Create environment file

Create a `.env` file in the `i2i-Academy-CryptoWallet-17` directory (same level as `pom.xml`):

```env
DB_USERNAME=postgres
DB_PASSWORD=postgres123
GEMINI_API_KEY=your_gemini_api_key_here
```

> **How to get Gemini API key:** Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key → Create API key in new project

### 3. Set IntelliJ environment variables

Open IntelliJ IDEA → Run → Edit Configurations → Environment Variables:

```
DB_USERNAME=postgres;DB_PASSWORD=postgres123;GEMINI_API_KEY=your_key_here
```

### 4. Start infrastructure (PostgreSQL + Redis)

```bash
cd i2i-Academy-CryptoWallet-17
docker-compose up -d
```

Verify containers are running:

```bash
docker ps
```

You should see:
- `cryptowallet-postgres` — PostgreSQL 15 on port 5432
- `cryptowallet-redis` — Redis 7 on port 6379

> The `init.sql` script runs automatically on first container startup and creates all required tables.

### 5. Run the backend

Open `i2i-Academy-CryptoWallet-17` folder in IntelliJ IDEA and run `CryptoWalletApplication.java`.

Or via Maven (PowerShell):

```powershell
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres123"
$env:GEMINI_API_KEY="your_key_here"
cd i2i-Academy-CryptoWallet-17
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

### 6. Run the frontend

```bash
cd cryptowallet-frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DB_USERNAME` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres123` |
| `GEMINI_API_KEY` | Google Gemini API key | `AQ.Ab8RN6...` |
| `SPRING_PROFILES_ACTIVE` | Data provider profile | `simulation` or `live` |
| `app.initial-balance.min` | Min starting balance (optional) | `1000` |
| `app.initial-balance.max` | Max starting balance (optional) | `10000` |

---

## API Documentation

Swagger UI is available at:

```
http://localhost:8080/swagger-ui/index.html
```

### Main Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get session token | No |
| POST | `/api/auth/logout` | Invalidate session | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/auth/balances` | Get all balances | Yes |
| GET | `/api/market/prices` | Get live crypto prices | No |
| POST | `/api/trading/buy` | Buy cryptocurrency | Yes |
| POST | `/api/trading/sell` | Sell cryptocurrency | Yes |
| POST | `/api/ai/query` | Ask AI assistant | Yes |

### Authentication

All protected endpoints require a `Bearer` token in the Authorization header:

```
Authorization: Bearer your-session-token
```

---

## Database Schema

```sql
-- Users table
users (id, username, email, password, created_at)

-- Balances table (USD + crypto holdings)
balances (id, user_id, currency, amount)

-- Transaction history
transactions (id, user_id, type, asset, amount, price, total, created_at)

-- Price history for trend analysis
price_history (id, asset, price, recorded_at)
```

---

## Data Provider Profiles

The system supports two data provider modes:

### Simulation (default)

Ticker Engine generates realistic random price fluctuations every 15 seconds.

```properties
spring.profiles.active=simulation
```

Supported assets: BTC, ETH, SOL, BNB, ADA, XRP, DOGE, DOT, AVAX, MATIC

### Live API

Connects to Binance public API for real market prices.

```properties
spring.profiles.active=live
```

> Note: Binance API may be restricted in some regions.

---

## Project Structure

```
i2i-Academy-CryptoWallet-17/
├── src/main/java/com/i2i/CryptoWallet/
│   ├── auth/                    # Authentication & session management
│   ├── market/                  # Market data, Ticker Engine, price caching
│   ├── trading/                 # Buy/sell operations, transaction logging
│   ├── ai/                      # Gemini AI integration
│   ├── user/                    # User & balance models
│   ├── config/                  # CORS, interceptors
│   └── common/                  # Exception handling
├── src/main/resources/
│   ├── application.properties
│   └── db/init.sql              # Auto-executed DDL on container startup
├── cryptowallet-frontend/       # React SPA
│   ├── src/
│   │   ├── pages/               # LoginPage, DashboardPage, ChatPage
│   │   └── services/api.js      # Axios configuration
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Team

| Name | Role |
|---|---|
| Doğa Eski | Auth Module, Database, Infrastructure |
| Yusuf İbrahim Başaran| Market Data, Trading Module, Ticker Engine |
| Yusuf Durmaz | AI Module, Frontend, Swagger, README |

---

## Notes

- Never commit `.env` file to GitHub — it is already in `.gitignore`
- Session tokens expire after 30 minutes
- Price history is stored every 15 seconds and used for AI context enrichment
- The AI assistant has access to your portfolio, transaction history, and live market prices
