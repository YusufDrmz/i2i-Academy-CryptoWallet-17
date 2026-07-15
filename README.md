# CryptoWallet

A full-stack enterprise cryptocurrency trading platform built with Spring Boot, Redis, PostgreSQL, and Google Gemini AI.

## Tech Stack

- **Backend:** Spring Boot 4.0.7, Java 21
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **AI:** Google Gemini API
- **Frontend:** React + Vite + Tailwind CSS

## Prerequisites

- Java 21
- Maven 3.9+
- Docker Desktop
- Node.js 22+

## Setup

### 1. Clone the repository
\```bash
git clone https://github.com/YusufDrmz/i2i-Academy-CryptoWallet-17.git
cd i2i-Academy-CryptoWallet-17
\```

### 2. Create .env file
Create a `.env` file in the project root:
\```
DB_USERNAME=postgres
DB_PASSWORD=postgres123
GEMINI_API_KEY=your_gemini_api_key
\```

### 3. Start infrastructure
\```bash
docker-compose up -d
\```

### 4. Run the backend
Open the project in IntelliJ IDEA and set environment variables:
\```
DB_USERNAME=postgres;DB_PASSWORD=postgres123;GEMINI_API_KEY=your_key
\```
Then run `CryptoWalletApplication.java`

### 5. Run the frontend
\```bash
cd cryptowallet-frontend
npm install
npm run dev
\```

## API Documentation

Swagger UI is available at:
\```
http://localhost:8080/swagger-ui/index.html
\```

## Project Structure

\```
├── src/main/java/com/i2i/CryptoWallet/
│   ├── auth/          # Authentication module
│   ├── market/        # Market data module
│   ├── trading/       # Trading module
│   ├── ai/            # AI insights module
│   └── common/        # Shared config and models
├── cryptowallet-frontend/  # React SPA
├── docker-compose.yml
└── src/main/resources/
    ├── application.properties
    └── db/init.sql
\```
