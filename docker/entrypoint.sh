#!/bin/sh
set -e
cd /app

# 1. 确保 .env 存在
[ -f .env ] || cp .env.example .env

# 2. 未设置 APP_KEY 时生成
if ! grep -qE '^APP_KEY=.+' .env; then
	php artisan key:generate --force
fi

# 3. 准备 SQLite 数据库文件与存储目录
mkdir -p /app/database/sqlite \
	/app/storage/framework/cache/data \
	/app/storage/framework/sessions \
	/app/storage/framework/views \
	/app/storage/logs
touch /app/database/sqlite/database.sqlite

# 4. 执行数据库迁移
php artisan migrate --force

# 5. 首次启动时创建管理员（由 compose 的环境变量控制）
if [ -n "$LYCHEE_ADMIN_USER" ] && [ -n "$LYCHEE_ADMIN_PASSWORD" ]; then
	USER_COUNT=$(php -r 'require "vendor/autoload.php"; $a=require "bootstrap/app.php"; $a->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo App\Models\User::count();' 2>/dev/null || echo 0)
	if [ "$USER_COUNT" = "0" ]; then
		php artisan lychee:create_user "$LYCHEE_ADMIN_USER" "$LYCHEE_ADMIN_PASSWORD"
	fi
fi

# 6. 修正 web 进程可写目录的属主
chown -R www-data:www-data /app/storage /app/public /app/database /app/bootstrap/cache

exec "$@"
