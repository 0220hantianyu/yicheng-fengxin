import { describe, it, expect } from 'vitest';
import { generateReminders } from '../weather-rules';
import type { WeatherDaily, AirQualityData } from '../../../../shared/types';

const makeDaily = (overrides: Partial<WeatherDaily> = {}): WeatherDaily => ({
  date: '2026-08-07',
  textDay: '晴',
  textNight: '晴',
  codeDay: '100',
  codeNight: '100',
  tempMax: 28,
  tempMin: 18,
  precipProbability: 0,
  windSpeed: '10',
  windScale: '2',
  windDir: '北风',
  humidity: 50,
  ...overrides,
});

describe('generateReminders - 雨天提醒', () => {
  it('暴雨应生成 danger 级别提醒', () => {
    const daily = makeDaily({ textDay: '暴雨', textNight: '暴雨' });
    const reminders = generateReminders(daily, undefined, 'near');
    const rainReminder = reminders.find(r => r.type === 'rain');
    expect(rainReminder).toBeDefined();
    expect(rainReminder!.level).toBe('danger');
    expect(rainReminder!.message).toContain('暴雨');
  });

  it('中雨应生成 warning 级别提醒', () => {
    const daily = makeDaily({ textDay: '中雨', textNight: '中雨' });
    const reminders = generateReminders(daily, undefined, 'near');
    const rainReminder = reminders.find(r => r.type === 'rain');
    expect(rainReminder).toBeDefined();
    expect(rainReminder!.level).toBe('warning');
  });

  it('小雨应生成 warning 级别提醒', () => {
    const daily = makeDaily({ textDay: '小雨', textNight: '小雨' });
    const reminders = generateReminders(daily, undefined, 'near');
    const rainReminder = reminders.find(r => r.type === 'rain');
    expect(rainReminder).toBeDefined();
    expect(rainReminder!.level).toBe('warning');
  });

  it('高降雨概率(>=60%)应生成提醒', () => {
    const daily = makeDaily({ precipProbability: 70 });
    const reminders = generateReminders(daily, undefined, 'near');
    const rainReminder = reminders.find(r => r.type === 'rain');
    expect(rainReminder).toBeDefined();
    expect(rainReminder!.level).toBe('warning');
    expect(rainReminder!.message).toContain('70%');
  });

  it('中降雨概率(30-59%)应生成 info 级别提醒', () => {
    const daily = makeDaily({ precipProbability: 40 });
    const reminders = generateReminders(daily, undefined, 'near');
    const rainReminder = reminders.find(r => r.type === 'rain');
    expect(rainReminder).toBeDefined();
    expect(rainReminder!.level).toBe('info');
  });

  it('无雨且低概率不应生成雨提醒', () => {
    const daily = makeDaily({ precipProbability: 0 });
    const reminders = generateReminders(daily, undefined, 'near');
    expect(reminders.find(r => r.type === 'rain')).toBeUndefined();
  });
});

describe('generateReminders - 高温提醒', () => {
  it('38°C以上应生成 danger 级别提醒', () => {
    const daily = makeDaily({ tempMax: 40 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'highTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('danger');
    expect(tempReminder!.message).toContain('高温');
  });

  it('35-37°C应生成 warning 级别提醒', () => {
    const daily = makeDaily({ tempMax: 36 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'highTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('warning');
  });

  it('32-34°C应生成 info 级别提醒', () => {
    const daily = makeDaily({ tempMax: 33 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'highTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('info');
  });

  it('32°C以下不应生成高温提醒', () => {
    const daily = makeDaily({ tempMax: 30 });
    const reminders = generateReminders(daily, undefined, 'near');
    expect(reminders.find(r => r.type === 'highTemp')).toBeUndefined();
  });
});

describe('generateReminders - 低温提醒', () => {
  it('零下温度应生成 warning 级别提醒', () => {
    const daily = makeDaily({ tempMin: -5 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'lowTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('warning');
    expect(tempReminder!.message).toContain('零下');
  });

  it('0-5°C应生成 warning 级别提醒', () => {
    const daily = makeDaily({ tempMin: 3 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'lowTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('warning');
  });

  it('最高温10°C以下应生成 info 级别提醒', () => {
    const daily = makeDaily({ tempMax: 8, tempMin: 6 });
    const reminders = generateReminders(daily, undefined, 'near');
    const tempReminder = reminders.find(r => r.type === 'lowTemp');
    expect(tempReminder).toBeDefined();
    expect(tempReminder!.level).toBe('info');
  });
});

describe('generateReminders - 大风提醒', () => {
  it('8级以上风力应生成 danger 级别提醒', () => {
    const daily = makeDaily({ windScale: '9' });
    const reminders = generateReminders(daily, undefined, 'near');
    const windReminder = reminders.find(r => r.type === 'wind');
    expect(windReminder).toBeDefined();
    expect(windReminder!.level).toBe('danger');
  });

  it('6-7级风力应生成 warning 级别提醒', () => {
    const daily = makeDaily({ windScale: '6' });
    const reminders = generateReminders(daily, undefined, 'near');
    const windReminder = reminders.find(r => r.type === 'wind');
    expect(windReminder).toBeDefined();
    expect(windReminder!.level).toBe('warning');
  });

  it('5级风力应生成 info 级别提醒', () => {
    const daily = makeDaily({ windScale: '5' });
    const reminders = generateReminders(daily, undefined, 'near');
    const windReminder = reminders.find(r => r.type === 'wind');
    expect(windReminder).toBeDefined();
    expect(windReminder!.level).toBe('info');
  });

  it('4级以下不应生成大风提醒', () => {
    const daily = makeDaily({ windScale: '3' });
    const reminders = generateReminders(daily, undefined, 'near');
    expect(reminders.find(r => r.type === 'wind')).toBeUndefined();
  });
});

describe('generateReminders - 空气质量提醒', () => {
  const badAqi: AirQualityData = { aqi: 180, category: '中度污染', pm2p5: 80, pm10: 120, primary: 'pm2p5' };
  const veryBadAqi: AirQualityData = { aqi: 250, category: '严重污染', pm2p5: 150, pm10: 200, primary: 'pm2p5' };
  const mediumAqi: AirQualityData = { aqi: 120, category: '轻度污染', pm2p5: 40, pm10: 60, primary: 'pm2p5' };
  const goodAqi: AirQualityData = { aqi: 50, category: '优', pm2p5: 15, pm10: 25, primary: '-' };

  it('AQI >= 200 应生成 danger 级别提醒', () => {
    const reminders = generateReminders(makeDaily(), veryBadAqi, 'near');
    const aqiReminder = reminders.find(r => r.type === 'airQuality');
    expect(aqiReminder).toBeDefined();
    expect(aqiReminder!.level).toBe('danger');
    expect(aqiReminder!.message).toContain('250');
  });

  it('AQI 150-199 应生成 warning 级别提醒', () => {
    const reminders = generateReminders(makeDaily(), badAqi, 'near');
    const aqiReminder = reminders.find(r => r.type === 'airQuality');
    expect(aqiReminder).toBeDefined();
    expect(aqiReminder!.level).toBe('warning');
  });

  it('AQI 100-149 应生成 info 级别提醒', () => {
    const reminders = generateReminders(makeDaily(), mediumAqi, 'near');
    const aqiReminder = reminders.find(r => r.type === 'airQuality');
    expect(aqiReminder).toBeDefined();
    expect(aqiReminder!.level).toBe('info');
  });

  it('AQI < 100 不应生成空气质量提醒', () => {
    const reminders = generateReminders(makeDaily(), goodAqi, 'near');
    expect(reminders.find(r => r.type === 'airQuality')).toBeUndefined();
  });
});

describe('generateReminders - 特殊日期类别', () => {
  it('过去日期应返回历史行程提示', () => {
    const reminders = generateReminders(makeDaily(), undefined, 'past');
    expect(reminders).toHaveLength(1);
    expect(reminders[0].type).toBe('info');
    expect(reminders[0].message).toContain('历史行程');
  });

  it('超过15天应返回暂不可预报提示', () => {
    const reminders = generateReminders(makeDaily(), undefined, 'beyond');
    expect(reminders).toHaveLength(1);
    expect(reminders[0].type).toBe('trend');
    expect(reminders[0].message).toContain('暂不可预报');
  });

  it('8-15天趋势应附加不确定性提醒', () => {
    const daily = makeDaily({ textDay: '晴' });
    const reminders = generateReminders(daily, undefined, 'far');
    const trendReminder = reminders.find(r => r.type === 'trend');
    expect(trendReminder).toBeDefined();
    expect(trendReminder!.message).toContain('不确定性');
  });
});
