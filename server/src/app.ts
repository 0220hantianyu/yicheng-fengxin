import express from 'express';
import cors from 'cors';
import geoRoutes from './routes/geo.js';
import weatherRoutes from './routes/weather.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- 速率限制（保护 QWeather API 配额） ---
const RATE_LIMIT = 120; // 每分钟每 IP 最多 120 次请求
const RATE_WINDOW = 60 * 1000; // 1 分钟窗口
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// 每 5 分钟清理过期条目，防止内存泄漏
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetTime) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

app.use('/api', (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({
      success: false,
      error: '请求过于频繁，请稍后再试',
    });
  }

  entry.count++;
  return next();
});

// --- API 路由 ---
app.use('/api/geo', geoRoutes);
app.use('/api/weather', weatherRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default app;
