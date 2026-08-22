# Lychee v4.12.0 定制镜像（去品牌版）

基于 Lychee v4.12.0 官方镜像定制，已内置以下修改（无需额外挂载任何 JS/CSS 文件）：

- 登录页：隐藏登录框上方的 Lychee 品牌与版本文字
- 相册底部：隐藏「Powered by Lychee」与「本网站上的所有图片」等品牌/版权文字
- 相册工具栏：新增「设置封面」按钮，可直接从网站全部照片中挑选一张设为相册封面（无需先把照片放进相册）

镜像已打包上传到 GitHub Container Registry（公开，amd64 + arm64），VPS 无需构建源码，一条命令直接拉取运行。

镜像：`ghcr.io/dgltsp-cpu/lychee-v4:v4.12.0-nobrand`

## 在 VPS 上安装（逐条执行）

**步骤 1：克隆仓库**
```bash
git clone https://github.com/dgltsp-cpu/lychee-v4.git
```

**步骤 2：进入目录并生成配置**
```bash
cd lychee-v4
cp .env.example .env
```

**步骤 3：修改默认密码（必须）**
```bash
vim .env
```
把 `ADMIN_PASSWORD=admin123` 改成你自己的强密码，保存退出。

**步骤 4：启动（首次运行自动拉取完整镜像并初始化）**
```bash
docker compose up -d
```

**步骤 5：确认运行状态**
```bash
docker compose ps
```
看到 `lychee-v4` 状态为 `Up` 即成功。

**步骤 6：访问**
浏览器打开 `http://VPS_IP:8082`，使用步骤 3 设置的用户名 `admin` 和密码登录。

> 如果 8082 端口被占用，编辑 `.env` 里的 `LYCHEE_PORT` 换成其他端口，再执行 `docker compose up -d`。
> 第一次启动后如需改密码，直接在 Lychee 界面「设置 → 账号」里修改即可。

## 常见操作

```bash
# 查看日志
docker compose logs -f lychee

# 停止
docker compose down

# 重新启动
docker compose up -d

# 升级（先 git pull 拉取新配置，再重建容器）
git pull
docker compose up -d --pull always
```

## 数据存储

照片与配置保存在 Docker 命名卷中，重建或升级容器不会丢失：

- `lychee_conf`：Lychee 配置与 SQLite 数据库
- `lychee_uploads`：所有上传的照片/视频

如需备份，直接备份这两个卷即可：

```bash
docker run --rm -v lychee-v4_lychee_uploads:/data -v $PWD:/backup alpine tar czf /backup/uploads.tar.gz -C /data .
docker run --rm -v lychee-v4_lychee_conf:/data -v $PWD:/backup alpine tar czf /backup/conf.tar.gz -C /data .
```
