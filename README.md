# Lychee v4.12.0 定制镜像（去品牌版）

基于 Lychee v4.12.0 官方镜像定制，所有修改已内置到镜像中（无需额外挂载任何 JS/CSS 文件），VPS 一条命令直接拉取运行。

镜像：`ghcr.io/dgltsp-cpu/lychee-v4:v4.12.0-nobrand`（公开，支持 amd64 + arm64）

## 已内置的定制内容

1. **登录框去品牌**：隐藏登录框上方的 Lychee 品牌与版本文字
2. **页脚去品牌**：隐藏「Powered by Lychee」与「本网站上的所有图片」等品牌/版权文字
3. **相册自定义封面**：相册工具栏新增「设置封面」按钮，可从网站全部照片中任选一张设为相册封面（无需先把照片放进相册）
4. **游客隐藏登录图标**：未登录时左上角不再显示登录图标，登录统一走固定网址（见下）
5. **游客隐藏管理按钮**：未登录进入相册时，右上角「设置封面」「关于相册」按钮自动隐藏；登录后恢复正常
6. **固定登录网址**：访问 `http://你的地址:8082/gallery#login` 直接弹出登录框（无论当前是否已登录），登录后地址栏自动清除 `#login`
7. **缓存刷新**：前端 JS 引用带版本号参数，更新镜像后无需手动清浏览器缓存

> 游客模式下仍保留：公开相册浏览、分享、下载、搜索、地图等功能，界面更干净。

## 定制源码（本仓库）

- `dist/frontend.html` / `dist/frontend.js` / `dist/cover-custom.js`：前端定制文件（已打包进镜像）
- `views/frontend.blade.php`：页面模板（JS 版本号参数，已打包进镜像）
- `Dockerfile`：镜像构建文件（`FROM lycheeorg/lychee:v4.12.0` + 覆盖以上文件）

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
看到 `lychee` 状态为 `Up` 即成功。

**步骤 6：访问**
- 游客浏览相册：`http://VPS_IP:8082`
- 管理员登录：`http://VPS_IP:8082/gallery#login`（用户名 `admin`，密码为步骤 3 设置的值）

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

# 升级（先 git pull 拉取新配置，再强制拉取新镜像重建）
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
