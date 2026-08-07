# 一程风信 — Vercel 部署指南

## 前置条件

1. 注册 [Vercel](https://vercel.com) 账号（可用 GitHub 登录）
2. 项目代码推送到 GitHub 仓库
3. 拥有和风天气 API Key（在 [和风天气控制台](https://console.qweather.com/) 获取）

## 部署步骤

### 1. 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/yi-cheng-feng-xin.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 打开 [vercel.com/new](https://vercel.com/new)
2. 选择你的 GitHub 仓库
3. Vercel 会自动检测配置（vercel.json 已就绪）

### 3. 配置环境变量

在 Vercel 项目的 Settings → Environment Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `QWEATHER_API_KEY` | 你的和风天气 API Key | 必填 |
| `QWEATHER_API_HOST` | 如 `abc123xyz.qweatherapi.com` | 必填，和风天气控制台获取 |
| `USE_MOCK` | `false` | 可选，设为 `true` 则使用演示数据 |

> **重要**：不要勾选 "Expose to all environments" 以外的任何选项，确保环境变量仅在 Production 和 Preview 中可用。

### 4. 部署

点击 "Deploy"，Vercel 会自动：
1. `npm install`（安装所有 workspace 依赖）
2. `cd client && npx vite build`（构建前端）
3. 部署 `api/[[...slug]].ts` 为 Serverless Function
4. 托管 `client/dist/` 为静态资源

部署完成后会获得一个 `xxx.vercel.app` 域名。

### 5. 验证

访问部署后的 URL，检查：
- 页面正常加载
- 搜索城市能返回结果
- 添加行程后能获取到真实天气数据
- 底部显示「和风天气（中国气象局）」而非「演示数据」

## 架构说明

```
浏览器 → Vercel CDN → 静态资源 (client/dist/)
                  → /api/* → Serverless Function (api/[[...slug]].ts)
                                → Express App (server/src/app.ts)
                                  → 和风天气 API
```

- **前端**：React + Vite 构建的 SPA，由 Vercel CDN 全球加速
- **后端**：Express app 作为 Vercel Serverless Function 运行
- **数据**：用户行程存储在浏览器 localStorage，无需数据库
- **速率限制**：每 IP 每分钟 120 次请求（防止 API 配额被滥用）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端并行）
npm run dev
# 前端: http://localhost:5173
# 后端: http://localhost:3001

# 运行测试
npm test
```

## 自定义域名

在 Vercel 项目设置 → Domains 中添加自定义域名，按提示配置 DNS 即可。
