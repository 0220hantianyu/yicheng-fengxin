import type { WeatherAdapter } from './weather-adapter.js';
import { QWeatherAdapter } from './qweather.js';
import { MockWeatherAdapter } from './mock.js';

let cachedAdapter: WeatherAdapter | null = null;

export function getWeatherAdapter(): WeatherAdapter {
  if (cachedAdapter) return cachedAdapter;

  const apiKey = process.env.QWEATHER_API_KEY;
  const apiHost = process.env.QWEATHER_API_HOST;
  const useMock = process.env.USE_MOCK === 'true';

  if (!useMock && apiKey && apiHost) {
    console.log('[Weather] Using QWeather adapter');
    cachedAdapter = new QWeatherAdapter(apiKey, apiHost);
  } else {
    console.log('[Weather] Using Mock adapter (demo mode)');
    cachedAdapter = new MockWeatherAdapter();
  }

  return cachedAdapter;
}
