import type { WeatherAdapter } from './weather-adapter.js';
import type { GeoSearchResult, WeatherData, WeatherDaily, AirQualityData } from 'shared/types';

/**
 * 和风天气 Adapter
 * 文档: https://dev.qweather.com/
 */
export class QWeatherAdapter implements WeatherAdapter {
  private apiKey: string;
  private apiHost: string;

  constructor(apiKey: string, apiHost: string) {
    this.apiKey = apiKey;
    this.apiHost = apiHost.replace(/^https?:\/\//, '').replace(/\/$/, '');
  }

  isMock(): boolean {
    return false;
  }

  /**
   * 无逐时 pop 数据时，根据降水量(mm)和天气文字估算降水概率
   */
  private estimatePop(precip: number, weatherText: string): number {
    // 天气文字中明确有雨/雪 → 高概率
    if (/暴雨|大暴雨/.test(weatherText)) return 95;
    if (/大雨/.test(weatherText)) return 85;
    if (/中雨/.test(weatherText)) return 75;
    if (/小雨|阵雨|雷阵雨/.test(weatherText)) return 60;
    if (/雨夹雪|冻雨/.test(weatherText)) return 65;
    if (/雪/.test(weatherText)) return 70;
    // 无明确文字但降水量 > 0 → 按量估算
    if (precip >= 25) return 90;
    if (precip >= 10) return 75;
    if (precip >= 5) return 55;
    if (precip >= 1) return 35;
    if (precip > 0) return 20;
    return 0;
  }

  private async request(path: string, params: Record<string, string>): Promise<any> {
    const url = new URL(`https://${this.apiHost}${path}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    url.searchParams.set('lang', 'zh');

    const resp = await fetch(url.toString(), {
      headers: { 'X-QW-Api-Key': this.apiKey },
    });

    if (!resp.ok) {
      throw new Error(`QWeather API error: ${resp.status} ${resp.statusText}`);
    }

    return resp.json();
  }

  async searchLocation(query: string): Promise<GeoSearchResult[]> {
    const data = await this.request('/geo/v2/city/lookup', {
      location: query,
      range: 'cn',
      number: '10',
    });

    if (data.code !== '200' || !data.location) {
      return [];
    }

    return data.location.map((loc: any) => ({
      name: loc.name,
      id: loc.id,
      lat: loc.lat,
      lon: loc.lon,
      adm1: loc.adm1,
      adm2: loc.adm2,
      country: loc.country,
    }));
  }

  async getWeatherForecast(locationId: string, lat: string, lon: string): Promise<WeatherData> {
    // 并行获取：7天日报 + 24小时逐时（取降水概率）
    const [daily7Data, hourly24Data] = await Promise.all([
      this.request('/v7/weather/7d', { location: locationId }),
      this.request('/v7/weather/24h', { location: locationId }).catch(() => null),
    ]);

    // 从逐时预报中提取每日最大降水概率
    const dailyPopMap = new Map<string, number>();
    if (hourly24Data?.code === '200' && hourly24Data.hourly) {
      for (const h of hourly24Data.hourly) {
        const date = h.fxTime?.split('T')[0];
        const pop = parseInt(h.pop || '0', 10);
        if (date && pop > (dailyPopMap.get(date) ?? 0)) {
          dailyPopMap.set(date, pop);
        }
      }
    }

    const dailyList: WeatherDaily[] = [];

    if (daily7Data.code === '200' && daily7Data.daily) {
      for (const d of daily7Data.daily) {
        const precip = parseFloat(d.precip || '0');
        dailyList.push({
          date: d.fxDate,
          textDay: d.textDay,
          textNight: d.textNight,
          codeDay: d.iconDay,
          codeNight: d.iconNight,
          tempMax: parseInt(d.tempMax, 10),
          tempMin: parseInt(d.tempMin, 10),
          // 优先使用 hourly pop；无逐时数据时根据降水量估算
          precipProbability: dailyPopMap.get(d.fxDate) ?? this.estimatePop(precip, d.textDay + d.textNight),
          precip: precip,
          windSpeed: d.windSpeedDay,
          windScale: d.windScaleDay,
          windDir: d.windDirDay,
          windSpeedNight: d.windSpeedNight,
          windScaleNight: d.windScaleNight,
          windDirNight: d.windDirNight,
          humidity: parseInt(d.humidity, 10),
          uvIndex: d.uvIndex,
          vis: d.vis,
          pressure: parseInt(d.pressure, 10),
        });
      }
    }

    // 尝试获取 15 天趋势（可能需要付费，失败则降级）
    try {
      const daily15Data = await this.request('/v7/weather/15d', { location: locationId });
      if (daily15Data.code === '200' && daily15Data.daily) {
        // 只添加 7 天之外的数据
        const existingDates = new Set(dailyList.map(d => d.date));
        for (const d of daily15Data.daily) {
          if (!existingDates.has(d.fxDate)) {
            const precip = parseFloat(d.precip || '0');
            dailyList.push({
              date: d.fxDate,
              textDay: d.textDay,
              textNight: d.textNight,
              codeDay: d.iconDay,
              codeNight: d.iconNight,
              tempMax: parseInt(d.tempMax, 10),
              tempMin: parseInt(d.tempMin, 10),
              precipProbability: dailyPopMap.get(d.fxDate) ?? this.estimatePop(precip, d.textDay + d.textNight),
              precip: precip,
              windSpeed: d.windSpeedDay,
              windScale: d.windScaleDay,
              windDir: d.windDirDay,
              windSpeedNight: d.windSpeedNight,
              windScaleNight: d.windScaleNight,
              windDirNight: d.windDirNight,
              humidity: parseInt(d.humidity, 10),
              uvIndex: d.uvIndex,
              vis: d.vis,
              pressure: parseInt(d.pressure, 10),
            });
          }
        }
      }
    } catch {
      // 15 天预报不可用，仅使用 7 天数据
    }

    // 尝试获取空气质量
    let airQuality: AirQualityData | undefined;
    try {
      const aqiData = await this.request('/airquality/v1/current/' + lat + '/' + lon, {});
      if (aqiData && aqiData.aqi) {
        const aqi = aqiData.aqi.value;
        airQuality = {
          aqi: aqi,
          category: aqiData.aqi.category,
          pm2p5: aqiData.pollutants?.find((p: any) => p.name === 'pm2p5')?.concentration?.value ?? 0,
          pm10: aqiData.pollutants?.find((p: any) => p.name === 'pm10')?.concentration?.value ?? 0,
          primary: aqiData.pollutants?.find((p: any) => p.isPrimary)?.name ?? '-',
        };
      }
    } catch {
      // 空气质量不可用
    }

    return {
      daily: dailyList,
      airQuality,
      source: 'qweather',
      updateTime: new Date().toISOString(),
    };
  }

  async getWeatherNow(locationId: string, _lat: string, _lon: string): Promise<WeatherData> {
    const data = await this.request('/v7/weather/now', { location: locationId });
    if (data.code !== '200' || !data.now) {
      throw new Error('Failed to get current weather');
    }

    const now = data.now;
    const today = new Date().toISOString().split('T')[0];

    return {
      daily: [{
        date: today,
        textDay: now.text,
        textNight: now.text,
        codeDay: now.icon,
        codeNight: now.icon,
        tempMax: parseInt(now.temp, 10),
        tempMin: parseInt(now.temp, 10),
        precipProbability: 0,
        windSpeed: now.windSpeed,
        windScale: now.windScale,
        windDir: now.windDir,
        humidity: parseInt(now.humidity, 10),
        feelsLike: parseInt(now.feelsLike, 10),
        vis: now.vis,
        pressure: parseInt(now.pressure, 10),
      }],
      source: 'qweather',
      updateTime: new Date().toISOString(),
    };
  }
}
