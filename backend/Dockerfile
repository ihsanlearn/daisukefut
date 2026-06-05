FROM php:8.4-fpm-alpine

RUN apk add --no-cache nginx git curl libpq-dev libzip-dev zip unzip supervisor
RUN docker-php-ext-install pdo pdo_pgsql zip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --optimize-autoloader

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN chmod -R 775 storage bootstrap/cache

EXPOSE 8000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
