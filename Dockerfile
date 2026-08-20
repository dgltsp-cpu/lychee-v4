# Lychee v4.13.0 本地构建镜像
FROM php:8.2-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
        libfreetype6-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \
        libzip-dev libsqlite3-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath exif gd mbstring opcache pdo_sqlite zip \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Apache 文档根指向 Laravel 的 public 目录
ENV APACHE_DOCUMENT_ROOT=/app/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/docker-php.conf

# PHP 运行参数（支持大图/大视频上传）
RUN printf 'upload_max_filesize=512M\npost_max_size=600M\nmax_execution_time=300\nmemory_limit=512M\n' > /usr/local/etc/php/conf.d/zz-lychee.ini

WORKDIR /app
COPY app/ /app/
COPY .env.example /app/.env.example
COPY docker/entrypoint.sh /usr/local/bin/lychee-entrypoint
RUN chmod +x /usr/local/bin/lychee-entrypoint

EXPOSE 80
ENTRYPOINT ["lychee-entrypoint"]
CMD ["apache2-foreground"]
