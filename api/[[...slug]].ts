import app from '../server/src/app.js';

/**
 * Vercel Serverless Function — catch-all API handler
 *
 * 所有 /api/* 请求由 Vercel 路由到此函数，
 * 再由 Express app 内部路由到 /api/geo、/api/weather 等端点。
 *
 * 直接导出 Express app，Vercel @vercel/node 运行时会自动适配。
 */
export default app;
