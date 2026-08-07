import type { WeatherDaily, WeatherReminder, AirQualityData } from '../../../shared/types';
import { getUvLevel } from './uv';

/**
 * 规则型智能天气提醒
 * 根据天气预报数据生成出行建议
 */

/**
 * 解析风力等级字符串（如 "1-3"），返回最大等级值
 */
function parseWindScale(scaleStr: string | undefined): number {
  if (!scaleStr) return 0;
  const s = scaleStr.trim();
  if (s.includes('-')) {
    const parts = s.split('-');
    return parseInt(parts[parts.length - 1], 10) || 0;
  }
  return parseInt(s, 10) || 0;
}
export function generateReminders(
  daily: WeatherDaily | undefined,
  airQuality: AirQualityData | undefined,
  dateCategory: 'near' | 'far' | 'beyond' | 'past'
): WeatherReminder[] {
  if (dateCategory === 'past') {
    return [{
      type: 'info',
      level: 'info',
      message: '此为历史行程，不查询天气',
      icon: 'clock',
    }];
  }

  if (dateCategory === 'beyond') {
    return [{
      type: 'trend',
      level: 'info',
      message: '暂不可预报，建议临近日期再刷新',
      icon: 'calendar-clock',
    }];
  }

  if (!daily) return [];

  const reminders: WeatherReminder[] = [];
  const textDay = daily.textDay || '';
  const textNight = daily.textNight || '';
  const allText = textDay + textNight;

  // 雨天提醒
  if (/暴雨|大暴雨|特大暴雨/.test(allText)) {
    reminders.push({
      type: 'rain',
      level: 'danger',
      message: '暴雨预警，建议减少外出，注意安全，预留充足交通时间',
      icon: 'cloud-rain',
    });
  } else if (/大雨|中雨/.test(allText)) {
    reminders.push({
      type: 'rain',
      level: 'warning',
      message: '有雨，请带伞，预留交通时间，注意路面湿滑',
      icon: 'cloud-rain',
    });
  } else if (/小雨|阵雨|雷阵雨/.test(allText)) {
    reminders.push({
      type: 'rain',
      level: 'warning',
      message: '可能有雨，建议带伞备用',
      icon: 'cloud-drizzle',
    });
  } else if (daily.precipProbability >= 60) {
    reminders.push({
      type: 'rain',
      level: 'warning',
      message: `降雨概率 ${daily.precipProbability}%，建议带伞`,
      icon: 'cloud-drizzle',
    });
  } else if (daily.precipProbability >= 30) {
    reminders.push({
      type: 'rain',
      level: 'info',
      message: `降雨概率 ${daily.precipProbability}%，可备伞`,
      icon: 'umbrella',
    });
  }

  // 高温提醒
  if (daily.tempMax >= 38) {
    reminders.push({
      type: 'highTemp',
      level: 'danger',
      message: '高温天气，注意防晒补水，减少正午户外活动，警惕中暑',
      icon: 'thermometer-sun',
    });
  } else if (daily.tempMax >= 35) {
    reminders.push({
      type: 'highTemp',
      level: 'warning',
      message: '天气炎热，注意防晒补水，尽量避免正午长时间户外',
      icon: 'sun',
    });
  } else if (daily.tempMax >= 32) {
    reminders.push({
      type: 'highTemp',
      level: 'info',
      message: '气温较高，注意防晒和补水',
      icon: 'sun',
    });
  }

  // 低温提醒
  if (daily.tempMin <= 0) {
    reminders.push({
      type: 'lowTemp',
      level: 'warning',
      message: '气温零下，注意添衣保暖，路面可能结冰',
      icon: 'snowflake',
    });
  } else if (daily.tempMin <= 5) {
    reminders.push({
      type: 'lowTemp',
      level: 'warning',
      message: '气温较低，建议穿厚外套或羽绒服',
      icon: 'thermometer-snow',
    });
  } else if (daily.tempMax <= 10) {
    reminders.push({
      type: 'lowTemp',
      level: 'info',
      message: '天气偏凉，建议添衣',
      icon: 'cloud-snow',
    });
  }

  // 大风提醒
  const windScale = parseWindScale(daily.windScale);
  if (windScale >= 8) {
    reminders.push({
      type: 'wind',
      level: 'danger',
      message: '大风天气，户外、海边、缆车等活动可能取消，注意安全',
      icon: 'wind',
    });
  } else if (windScale >= 6) {
    reminders.push({
      type: 'wind',
      level: 'warning',
      message: '风力较大，户外活动注意安全，海边/高空活动可能受影响',
      icon: 'wind',
    });
  } else if (windScale >= 5) {
    reminders.push({
      type: 'wind',
      level: 'info',
      message: '有风，户外活动注意防风',
      icon: 'wind',
    });
  }

  // 紫外线防晒提醒
  const uvLevel = getUvLevel(daily.uvIndex);
  if (uvLevel) {
    if (uvLevel.level === 'danger') {
      reminders.push({
        type: 'uv',
        level: 'danger',
        message: `紫外线${uvLevel.name}（指数${daily.uvIndex}），${uvLevel.advice}`,
        icon: 'sun',
      });
    } else if (uvLevel.level === 'warning') {
      reminders.push({
        type: 'uv',
        level: 'warning',
        message: `紫外线${uvLevel.name}（指数${daily.uvIndex}），${uvLevel.advice}`,
        icon: 'sun',
      });
    } else if (uvLevel.name === '中等') {
      reminders.push({
        type: 'uv',
        level: 'info',
        message: `紫外线${uvLevel.name}（指数${daily.uvIndex}），${uvLevel.advice}`,
        icon: 'sun',
      });
    }
    // 弱(0-2)不产生提醒
  }

  // 空气质量提醒
  if (airQuality) {
    if (airQuality.aqi >= 200) {
      reminders.push({
        type: 'airQuality',
        level: 'danger',
        message: `空气质量严重污染（AQI ${airQuality.aqi}），建议戴口罩，减少户外活动`,
        icon: 'mask',
      });
    } else if (airQuality.aqi >= 150) {
      reminders.push({
        type: 'airQuality',
        level: 'warning',
        message: `空气质量较差（AQI ${airQuality.aqi}），建议戴口罩，减少长时间户外`,
        icon: 'mask',
      });
    } else if (airQuality.aqi >= 100) {
      reminders.push({
        type: 'airQuality',
        level: 'info',
        message: `空气质量一般（AQI ${airQuality.aqi}），敏感人群注意防护`,
        icon: 'wind',
      });
    }
  }

  // 8-15 天趋势提醒
  if (dateCategory === 'far') {
    reminders.push({
      type: 'trend',
      level: 'info',
      message: '15 天预报存在不确定性，建议临近日期刷新获取准确预报',
      icon: 'calendar-clock',
    });
  }

  return reminders;
}

/**
 * 获取提醒级别对应的颜色类
 */
export function getReminderColorClass(level: 'info' | 'warning' | 'danger'): string {
  const colors = {
    info: 'bg-dawn-50 text-dawn-600',
    warning: 'bg-warm-500/10 text-warm-600',
    danger: 'bg-storm-500/10 text-storm-600',
  };
  return colors[level];
}

/**
 * 生成天气行程摘要文本（用于复制）
 */
export function generateWeatherSummary(
  tripName: string,
  items: Array<{
    date: string;
    city: string;
    district?: string;
    textDay?: string;
    tempMax?: number;
    tempMin?: number;
    precipProbability?: number;
    reminders: WeatherReminder[];
  }>
): string {
  const lines: string[] = [];
  lines.push(`【${tripName || '一程风信'}】行程天气摘要`);
  lines.push('');

  for (const item of items) {
    const location = item.district ? `${item.city}·${item.district}` : item.city;
    let weatherStr = '暂无天气数据';
    if (item.textDay) {
      weatherStr = `${item.textDay} ${item.tempMax ?? '--'}°/${item.tempMin ?? '--'}°`;
      if (item.precipProbability && item.precipProbability > 0) {
        weatherStr += ` 降雨${item.precipProbability}%`;
      }
    }
    lines.push(`📅 ${item.date} ${location}`);
    lines.push(`   ${weatherStr}`);
    if (item.reminders.length > 0) {
      const reminderTexts = item.reminders.map(r => r.message).join('；');
      lines.push(`   ⚡ ${reminderTexts}`);
    }
    lines.push('');
  }

  lines.push('—— 由一程风信生成');
  return lines.join('\n');
}
