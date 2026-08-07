# 一程风信

> 根据旅游行程提供天气预报的 MVP 网站

面向中文个人旅行者/家庭游用户，输入行程即可获取对应日期的天气预报和智能出行提醒。

## 功能概览

- **行程时间线**：首屏即工具，按日期分组展示行程
- **天气查询**：根据行程日期自动获取天气，支持 7 天详细预报和 8-15 天趋势
- **智能提醒**：雨/高温/低温/大风/空气质量等规则型出行建议
- **截图识别**：上传行程截图，浏览器端 OCR 自动解析日期、城市、时段
- **导出图片**：一键生成"一页行程天气笺"，适合分享到微信/群聊
- **本地存储**：行程数据保存在浏览器，不上传服务器
- **移动优先**：手机端完美适配，旅行途中随时查看

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite 6 + TypeScript |
| 后端 | Node.js + Express + TypeScript |
| 样式 | Tailwind CSS（自定义色板） |
| 图标 | lucide-react |
| OCR | Tesseract.js（浏览器端） |
| 图片导出 | html2canvas |
| 状态管理 | Zustand（localStorage 持久化） |
| 测试 | Vitest |

## 快速开始

### 1. 安装依赖

```bash
cd D:\Projects\一程风信
npm install
```

### 2. 本地开发

```bash
npm run dev
```

同时启动前端 (http://localhost:5173) 和后端 (http://localhost:3001)。

前端开发服务器已配置代理，`/api/*` 请求自动转发到后端。

### 3. 配置天气 API（可选）

```bash
cp server/.env.example server/.env
```

编辑 `server/.env`：

```
QWEATHER_API_KEY=你的API密钥
QWEATHER_API_HOST=你的专属APIHost
```

> 未配置时自动使用演示模式（Mock），界面会明确标注"演示数据"。

### 4. 运行测试

```bash
npm test
```

## 天气 API 说明

### 选择的 API：和风天气 (QWeather)

| 能力 | 说明 |
|------|------|
| 中文地点搜索 | GeoAPI `/geo/v2/city/lookup`，支持城市/区县模糊搜索 |
| 7天详细预报 | `/v7/weather/7d` |
| 15天趋势 | `/v7/weather/15d` |
| 空气质量 | `/airquality/v1/current/{lat}/{lon}` |
| 免费额度 | 每月前 5 万次免费（2025年3月新定价） |
| 认证方式 | API KEY（`X-QW-Api-Key` 请求头） |

### 获取 API Key

1. 访问 [和风天气开发者平台](https://console.qweather.com/) 注册
2. 创建项目，获取 API KEY 和专属 API Host
3. 填入 `server/.env`

### 降级策略

- **无 API Key** → 自动切换 Mock 模式，使用模拟天气数据
- **15天预报不可用** → 仅使用 7 天数据，8-15 天显示"趋势仅供参考"
- **空气质量不可用** → 不影响天气展示，仅缺少 AQI 数据

### Adapter 架构

后端天气服务封装为可替换 adapter：

```
server/src/adapters/
├── weather-adapter.ts   # 接口定义
├── qweather.ts          # 和风天气实现
├── mock.ts              # Mock 实现
└── index.ts             # 自动选择
```

未来更换供应商只需实现 `WeatherAdapter` 接口。

## 日期分类逻辑

| 分类 | 条件 | 行为 |
|------|------|------|
| past | 过去日期 | 标记为历史行程，不查询天气 |
| near | 未来 1-7 天 | 显示详细天气预报 |
| far | 未来 8-15 天 | 显示天气趋势，提示不确定性 |
| beyond | 超过 15 天 | 不显示天气，提示临近刷新 |

天气数据超过 6 小时自动提示刷新。8-15 天趋势进入 7 天范围后自动升级为详细预报。

## 隐私与数据处理

- **无注册/登录**：MVP 不做用户系统
- **本地存储**：行程数据保存在浏览器 localStorage，不上传服务器
- **OCR 本地完成**：截图在浏览器端识别，图片不离开设备
- **API Key 安全**：天气 API Key 只在后端环境变量中，前端不接触
- **无云端同步**：MVP 不做行程云同步

> 未来如接入后端 OCR/AI，会明确提示用户图片将被发送处理。

## 设计规格

### 色板

| 名称 | 色值 | 用途 |
|------|------|------|
| 晨蓝 | `#3b82f6` | 主色调 |
| 米白纸 | `#fdfbf7` | 背景色 |
| 松绿 | `#22c55e` | 成功/确认 |
| 暖橙 | `#f97316` | 提醒/警告 |
| 雨蓝 | `#3b82f6` | 降雨相关 |
| 低温蓝 | `#6366f1` | 低温相关 |
| 暴雨红 | `#ef4444` | 危险级别 |
| 灰紫 | `#8b5cf6` | 空气质量 |

### 字体

`PingFang SC`, `Microsoft YaHei`, `Helvetica Neue`, `Arial`

### 圆角

统一 8px (`rounded-paper`)

### 阴影

- 卡片：`0 1px 3px rgba(0,0,0,0.08)`
- 悬浮：`0 4px 12px rgba(0,0,0,0.1)`

### 图标

统一使用 lucide-react 线性图标

### 导出图片风格

"一页行程天气笺"：白底纸质感卡片，包含标题、旅行名称、日期范围、按日期排列的天气行程，底部小字标注数据更新时间和不确定性提示。

## 项目结构

```
一程风信/
├── client/                    # 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── stores/            # Zustand 状态管理
│   │   ├── services/          # API 调用
│   │   ├── utils/             # 工具函数 + 测试
│   │   └── App.tsx            # 主应用
│   ├── tailwind.config.js     # 自定义色板
│   └── vite.config.ts         # Vite + 代理配置
├── server/                    # 后端
│   ├── src/
│   │   ├── adapters/          # 天气 API adapter
│   │   ├── routes/            # API 路由
│   │   └── index.ts           # Express 入口
│   └── .env.example           # 环境变量模板
├── shared/                    # 前后端共享类型
└── package.json               # npm workspaces
```

## API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/geo/search?q=` | GET | 搜索城市/区县 |
| `/api/weather/forecast?locationId=&lat=&lon=` | GET | 获取天气预报 |
| `/api/weather/now?locationId=&lat=&lon=` | GET | 获取实时天气 |
| `/api/weather/status` | GET | 服务状态（是否 Mock） |
| `/api/ocr` | POST | OCR 接口预留（MVP 在前端完成） |
| `/api/health` | GET | 健康检查 |

## 公网部署

### 环境变量清单

| 变量 | 必填 | 说明 |
|------|------|------|
| `QWEATHER_API_KEY` | 否 | 和风天气 API Key |
| `QWEATHER_API_HOST` | 否 | 和风天气专属 API Host |
| `PORT` | 否 | 后端端口，默认 3001 |
| `USE_MOCK` | 否 | 强制使用 Mock 模式 |

### Vercel 部署步骤

1. **Fork/推送到 GitHub**

2. **在 Vercel 创建项目**
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **配置环境变量**
   - 在 Vercel 项目设置中添加 `QWEATHER_API_KEY` 和 `QWEATHER_API_HOST`

4. **后端部署**
   - 后端需部署到支持 Node.js 的平台（如 Render、Railway）
   - 或将后端逻辑迁移到 Vercel Serverless Functions

### Render 部署步骤

1. **创建 Web Service**
   - 连接 GitHub 仓库
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **配置环境变量**
   - 在 Render Dashboard 中添加环境变量

3. **前端部署到 Vercel/Netlify**
   - 修改前端 API 地址指向 Render 后端

## 已知限制

- 15 天预报精度低于 7 天，仅供参考
- 浏览器端 OCR 对复杂截图识别率有限
- localStorage 容量有限（约 5-10MB），不适合大量行程
- 无云端同步，更换设备/浏览器需重新输入
- 和风天气免费额度每月 5 万次，高频使用可能超额

## MVP 不包含的功能

- 用户注册/登录
- 云端行程同步
- 多人协作
- 付费系统
- 酒店/景点管理
- 路线规划
- 提醒通知

以上功能在代码结构中已预留扩展空间。

## License

MIT
