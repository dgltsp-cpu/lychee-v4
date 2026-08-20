# Lychee v4.13.0 本地部署

独立于现有 v7.7.3 部署，使用 SQLite（无需 MySQL 容器），访问地址 http://localhost:8001

## 启动

```bash
cd /Users/hhm/Documents/分享项目文件/lychee-v4
docker compose up -d --build
```

浏览器打开 http://localhost:8001 ，默认管理员账号（首次启动自动创建）：

- 用户名：`admin`
- 密码：`admin1234`

可通过环境变量覆盖：`LYCHEE_ADMIN_USER`、`LYCHEE_ADMIN_PASSWORD`。

## 常用操作

```bash
# 查看日志
docker compose logs -f lychee

# 手动创建用户
docker compose exec lychee php artisan lychee:create_user <用户名> <密码>

# 停/启
docker compose down
docker compose up -d
```

数据（照片、数据库、日志）保存在 Docker 命名卷中，重建容器不会丢失：
`lychee_v4_uploads`、`lychee_v4_db`、`lychee_v4_storage`。

## GitHub 仓库与 VPS 部署

仓库：https://github.com/dgltsp-cpu/lychee-v4（公开）
`.env`、`src/`、`Lychee.zip` 已 gitignore 不入库；Dockerfile 只依赖 `app/`。GHCR 已发布多架构镜像（amd64 + arm64），VPS 直接拉取即可，无需源码构建。

### VPS 安装步骤（逐条执行）

**步骤 1：克隆仓库**
```bash
git clone https://github.com/dgltsp-cpu/lychee-v4.git
```

**步骤 2：进入目录**
```bash
cd lychee-v4
```

**步骤 3：生成配置文件**
```bash
cp .env.example .env
```

**步骤 4：启动（自动拉取镜像并运行，首次启动自动建库和创建管理员）**
```bash
docker compose up -d
```

**步骤 5：确认运行状态**
```bash
docker compose ps
```

### 访问与账号

浏览器打开 `http://VPS_IP:8001`：

- 用户名：`admin`
- 密码：`admin1234`

可用环境变量覆盖（写进 `.env` 或 compose 的 `environment`）：`LYCHEE_ADMIN_USER`、`LYCHEE_ADMIN_PASSWORD`。

### 常用操作

- 查看日志：`docker compose logs -f`
- 升级：`git pull` 后执行 `docker compose up -d`
- 修改端口：编辑 `docker-compose.yml` 里的 `8001:80`
- 想从源码自己构建：取消 `docker-compose.yml` 里 `build` 注释后执行 `docker compose up -d --build`
- 数据（照片、SQLite、日志）在 Docker 命名卷中，重建/升级容器不丢
