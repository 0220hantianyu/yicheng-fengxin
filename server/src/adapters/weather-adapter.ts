import type { GeoSearchResult, WeatherData } from 'shared/types';

/**
 * 天气服务 Adapter 接口
 * 未来更换供应商时只需实现此接口
 */
export interface WeatherAdapter {
  /** 搜索地点 */
  searchLocation(query: string): Promise<GeoSearchResult[]>;

  /** 获取天气预报（7天详细 + 15天趋势） */
  getWeatherForecast(locationId: string, lat: string, lon: string): Promise<WeatherData>;

  /** 获取实时天气 */
  getWeatherNow(locationId: string, lat: string, lon: string): Promise<WeatherData>;

  /** 是否为演示模式 */
  isMock(): boolean;
}
