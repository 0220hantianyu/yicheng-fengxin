import { Router } from 'express';
import { getWeatherAdapter } from '../adapters/index.js';

const router = Router();

/** GET /api/geo/search?q=北京 */
router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const adapter = getWeatherAdapter();
    const results = await adapter.searchLocation(q);
    return res.json({ success: true, data: results });
  } catch (err: any) {
    console.error('[Geo] Search error:', err.message);
    return res.status(500).json({ success: false, error: '地点搜索失败' });
  }
});

export default router;
