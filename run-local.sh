#!/bin/bash
set -a
source .env
set +a

./mvnw spring-boot:run -Dspring-boot.run.arguments="\
--spring.datasource.url=jdbc:postgresql://${DB_HOST:-localhost}:${DB_PORT:-5432}/${DB_NAME:-cryptowallet} \
--spring.datasource.username=${DB_USERNAME} \
--spring.datasource.password=${DB_PASSWORD} \
--spring.data.redis.host=${REDIS_HOST:-localhost} \
--spring.data.redis.port=${REDIS_PORT:-6379}"
