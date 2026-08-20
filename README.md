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

本目录已作为**新仓库**托管：https://github.com/dgltsp-cpu/lychee-v4（私有）。
`.env`、`src/`、`Lychee.zip` 已加入 `.gitignore` 不会入库；Dockerfile 只依赖 `app/`（含 vendor），克隆后可直接构建。

### VPS 拉取部署（需已装 Docker + Compose）

**推荐：直接拉预构建镜像（免源码构建）**，本仓库已在 GHCR 发布镜像：

```bash
docker pull ghcr.io/dgltsp-cpu/lychee-v4:4.13.0   # 私有包需先 docker login ghcr.io
```

克隆仓库（compose 已默认指向镜像）：

```bash
git clone https://github.com/dgltsp-cpu/lychee-v4.git
cd lychee-v4
cp .env.example .env
docker compose up -d       # 直接拉取运行，无需 --build
```

方式一（备选）：HTTPS 源码构建（VPS 上用带 repo 权限的 GitHub 个人访问令牌代替密码）

```bash
git clone https://github.com/dgltsp-cpu/lychee-v4.git
cd lychee-v4
cp .env.example .env            # 按需修改 APP_URL 等
docker compose up -d --build    # 首次自动迁移数据库并创建管理员
```

方式二：SSH Deploy Key（私有仓库只读授权，推荐）

```bash
ssh-keygen -t ed25519 -f ~/.ssh/lychee_v4_deploy -N "" -C "vps-lychee-v4"
cat ~/.ssh/lychee_v4_deploy.pub   # 复制公钥 → GitHub 仓库 Settings → Deploy keys → Add deploy key
GIT_SSH_COMMAND='ssh -i ~/.ssh/lychee_v4_deploy' git clone git@github.com:dgltsp-cpu/lychee-v4.git
cd lychee-v4 && cp .env.example .env && docker compose up -d --build
```

- 端口默认 8001，可改 `docker-compose.yml` 里的 `8001:80`
- 管理员默认 `admin` / `admin1234`，可用 `LYCHEE_ADMIN_USER`、`LYCHEE_ADMIN_PASSWORD` 环境变量覆盖
- 升级：`git pull` 后执行 `docker compose up -d --build`
- 数据（照片、SQLite、日志）在 Docker 命名卷中，重建/升级容器不丢
