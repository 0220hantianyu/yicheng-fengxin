import type { GeoSearchResult, WeatherData } from '../../../shared/types';

const API_BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`API error: ${resp.status}`);
  }
  const json = await resp.json();
  if (!json.success) {
    throw new Error(json.error || 'API request failed');
  }
  return json.data as T;
}

export const api = {
  /** 搜索地点 */
  async searchLocation(query: string): Promise<GeoSearchResult[]> {
    return fetchJson(`${API_BASE}/geo/search?q=${encodeURIComponent(query)}`);
  },

  /** 获取天气预报 */
  async getForecast(locationId: string, lat: string, lon: string): Promise<{ data: WeatherData; mock: boolean }> {
    const resp = await fetch(
      `${API_BASE}/weather/forecast?locationId=${locationId}&lat=${lat}&lon=${lon}`
    );
    const json = await resp.json();
    if (!json.success) throw new Error(json.error);
    return { data: json.data, mock: json.mock };
  },

  /** 获取服务状态 */
  async getStatus(): Promise<{ mock: boolean; source: string }> {
    return fetchJson(`${API_BASE}/weather/status`);
  },
};
