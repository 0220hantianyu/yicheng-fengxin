import { Router } from 'express';
import { getWeatherAdapter } from '../adapters/index.js';

const router = Router();

/** GET /api/weather/forecast?locationId=101010100&lat=39.9&lon=116.4 */
router.get('/forecast', async (req, res) => {
  try {
    const { locationId, lat, lon } = req.query;

    if (!locationId) {
      return res.status(400).json({ success: false, error: '缺少 locationId' });
    }

    const adapter = getWeatherAdapter();
    const data = await adapter.getWeatherForecast(
      locationId as string,
      (lat as string) || '',
      (lon as string) || ''
    );

    return res.json({
      success: true,
      data,
      mock: adapter.isMock(),
    });
  } catch (err: any) {
    console.error('[Weather] Forecast error:', err.message);
    return res.status(500).json({ success: false, error: '天气查询失败: ' + err.message });
  }
});

/** GET /api/weather/now?locationId=101010100&lat=39.9&lon=116.4 */
router.get('/now', async (req, res) => {
  try {
    const { locationId, lat, lon } = req.query;

    if (!locationId) {
      return res.status(400).json({ success: false, error: '缺少 locationId' });
    }

    const adapter = getWeatherAdapter();
    const data = await adapter.getWeatherNow(
      locationId as string,
      (lat as string) || '',
      (lon as string) || ''
    );

    return res.json({
      success: true,
      data,
      mock: adapter.isMock(),
    });
  } catch (err: any) {
    console.error('[Weather] Now error:', err.message);
    return res.status(500).json({ success: false, error: '实时天气查询失败' });
  }
});

/** GET /api/weather/status - 返回当前服务状态 */
router.get('/status', (_req, res) => {
  const adapter = getWeatherAdapter();
  return res.json({
    success: true,
    data: {
      mock: adapter.isMock(),
      source: adapter.isMock() ? '演示数据' : '和风天气',
    },
  });
});

export default router;
