import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`[Server] 一程风信后端服务已启动: http://localhost:${PORT}`);
  const useMock = !process.env.QWEATHER_API_KEY || !process.env.QWEATHER_API_HOST || process.env.USE_MOCK === 'true';
  if (useMock) {
    console.log('[Server] 当前为演示模式（Mock），天气数据为模拟数据');
    console.log('[Server] 配置真实 API Key 请参考 server/.env.example');
  }
});
