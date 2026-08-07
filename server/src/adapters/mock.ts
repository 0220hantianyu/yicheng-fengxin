import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { WeatherAdapter } from './weather-adapter.js';
import type { GeoSearchResult, WeatherData, WeatherDaily } from 'shared/types';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Mock 天气 Adapter
 * 无 API Key 时使用，返回演示数据
 * 城市数据来源：和风天气官方 China-City-List（3577 个县级以上城市）
 */
export class MockWeatherAdapter implements WeatherAdapter {
  private mockCities: GeoSearchResult[];

  constructor() {
    // 从 JSON 文件加载完整城市列表（3577 个县级以上城市）
    try {
      const dataPath = join(__dirname, '..', 'data', 'china-cities.json');
      const raw = readFileSync(dataPath, 'utf-8');
      this.mockCities = JSON.parse(raw) as GeoSearchResult[];
    } catch {
      // 降级：如果文件不存在，使用空数组
      this.mockCities = [];
    }
  }

  isMock(): boolean {
    return true;
  }

  async searchLocation(query: string): Promise<GeoSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    // 优先级：城市名完全匹配 > 城市名包含 > 省/地包含
    const nameExact: GeoSearchResult[] = [];
    const nameIncludes: GeoSearchResult[] = [];
    const admIncludes: GeoSearchResult[] = [];

    for (const c of this.mockCities) {
      if (c.name === q) {
        nameExact.push(c);
      } else if (c.name.includes(q)) {
        nameIncludes.push(c);
      } else if (c.adm1.includes(q) || c.adm2.includes(q)) {
        admIncludes.push(c);
      }
    }

    // 合并并去重，限制最多返回 20 条
    const seen = new Set<string>();
    const result: GeoSearchResult[] = [];
    for (const c of [...nameExact, ...nameIncludes, ...admIncludes]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      result.push(c);
      if (result.length >= 20) break;
    }

    return result;
  }

  private generateMockDaily(days: number): WeatherDaily[] {
    const conditions = [
      { textDay: '晴', textNight: '晴', code: '100', precip: 0 },
      { textDay: '多云', textNight: '多云', code: '101', precip: 10 },
      { textDay: '阴', textNight: '阴', code: '104', precip: 20 },
      { textDay: '小雨', textNight: '小雨', code: '305', precip: 60 },
      { textDay: '中雨', textNight: '中雨', code: '306', precip: 80 },
      { textDay: '雷阵雨', textNight: '雷阵雨', code: '302', precip: 75 },
      { textDay: '大雨', textNight: '大雨', code: '307', precip: 90 },
    ];

    const windDirs = ['北风', '南风', '东风', '西风', '东北风', '东南风', '西北风', '西南风'];

    const result: WeatherDaily[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Use a pseudo-random based on date for consistency
      const seed = date.getDate() + date.getMonth() * 31;
      const cond = conditions[seed % conditions.length];
      const tempBase = 20 + (seed % 15);
      const windDir = windDirs[seed % windDirs.length];
      const windScale = String((seed % 5) + 1);

      result.push({
        date: dateStr,
        textDay: cond.textDay,
        textNight: cond.textNight,
        codeDay: cond.code,
        codeNight: cond.code,
        tempMax: tempBase + 5,
        tempMin: tempBase - 3,
        precipProbability: cond.precip,
        windSpeed: String((seed % 20) + 5),
        windScale,
        windDir,
        humidity: 40 + (seed % 50),
        uvIndex: String((seed % 10) + 1),
        vis: String(10 + (seed % 15)),
        pressure: 1000 + (seed % 20),
      });
    }

    return result;
  }

  async getWeatherForecast(_locationId: string, _lat: string, _lon: string): Promise<WeatherData> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      daily: this.generateMockDaily(15),
      airQuality: {
        aqi: 45,
        category: '良',
        pm2p5: 20,
        pm10: 35,
        primary: 'pm2p5',
      },
      source: 'mock',
      updateTime: new Date().toISOString(),
    };
  }

  async getWeatherNow(_locationId: string, _lat: string, _lon: string): Promise<WeatherData> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      daily: this.generateMockDaily(1),
      source: 'mock',
      updateTime: new Date().toISOString(),
    };
  }
}
