# Multi-stage Dockerfile for Laravel + Vite (Inertia)

# 1) Composer dependencies
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-ansi --no-progress --prefer-dist --optimize-autoloader
COPY . .
RUN composer install --no-dev --no-interaction --no-ansi --no-progress --prefer-dist --optimize-autoloader

# 2) Frontend build
FROM node:20-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# 3) Runtime (simple: PHP CLI with built-in server)
# Note: This is suitable for dev/staging. For production, prefer nginx + php-fpm.
FROM php:8.2-cli-alpine AS runtime

WORKDIR /var/www/html

# Install required PHP extensions (sqlite, pdo, etc.) and tools
RUN apk add --no-cache libzip-dev oniguruma-dev sqlite-libs bash git curl && \
  docker-php-ext-install pdo pdo_sqlite

# Copy application code
COPY . .

# Copy vendor from composer stage
COPY --from=vendor /app/vendor ./vendor

# Copy built assets from frontend stage
COPY --from=frontend /app/public/build ./public/build

# Optimize Laravel
ENV APP_ENV=production \
  APP_DEBUG=false \
  LOG_CHANNEL=stderr \
  PHP_CLI_SERVER_WORKERS=4

# Ensure storage and cache directories are writable
RUN mkdir -p storage/framework/{cache,data,sessions,views} storage/logs bootstrap/cache && \
  chown -R www-data:www-data storage bootstrap/cache

# Cache config/routes/views if env permits (non-fatal if no .env yet)
RUN php -r "file_exists('.env') || copy('.env.example', '.env');" && \
  php artisan key:generate --force && \
  php artisan config:cache && \
  php artisan route:cache || true && \
  php artisan view:cache || true

EXPOSE 8000

# Default command runs Laravel's built-in server
CMD ["sh", "-lc", "php artisan serve --host=0.0.0.0 --port=8000"]


