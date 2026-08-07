import { useState } from 'react';
import {
  Cloud, CloudRain, CloudSnow, CloudSun, Sun, CloudFog,
  CloudLightning, Wind, Droplets, Eye, Gauge, Sun as SunIcon,
  ChevronDown, ChevronUp, RefreshCw, Clock, AlertTriangle, Umbrella,
  ThermometerSun, ThermometerSnowflake, Wind as WindIcon, Shield, CalendarClock,
} from 'lucide-react';
import type { ItineraryItem, WeatherDaily, WeatherReminder, AirQualityData } from '../../../shared/types';
import { classifyDate, getDateCategoryLabel, formatDateChinese, isWeatherStale } from '../utils/date';
import { generateReminders, getReminderColorClass } from '../utils/weather-rules';
import { getUvLevel } from '../utils/uv';

interface WeatherCardProps {
  item: ItineraryItem;
  onRefresh: () => void;
  refreshing: boolean;
}

// 天气代码 -> 图标映射
function getWeatherIcon(code: string, size: number = 28) {
  const codeNum = parseInt(code, 10);
  const iconProps = { size, className: 'shrink-0' };

  if (codeNum === 100 || codeNum === 150) return <Sun {...iconProps} className="shrink-0 text-warm-500" />;
  if ([101, 102, 103, 151, 152, 153].includes(codeNum)) return <CloudSun {...iconProps} className="shrink-0 text-dawn-400" />;
  if ([104, 154].includes(codeNum)) return <Cloud {...iconProps} className="shrink-0 text-gray-400" />;
  if ([300, 301, 302, 303].includes(codeNum)) return <CloudLightning {...iconProps} className="shrink-0 text-cold-500" />;
  if ([304, 305, 306, 307, 308, 309, 310, 311, 312, 313].includes(codeNum)) return <CloudRain {...iconProps} className="shrink-0 text-rain-500" />;
  if ([314, 315, 316, 317, 318, 399].includes(codeNum)) return <CloudRain {...iconProps} className="shrink-0 text-rain-600" />;
  if ([400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 499].includes(codeNum)) return <CloudSnow {...iconProps} className="shrink-0 text-cold-400" />;
  if ([500, 501, 502, 503, 504, 507, 508].includes(codeNum)) return <CloudFog {...iconProps} className="shrink-0 text-gray-400" />;
  return <Cloud {...iconProps} className="shrink-0 text-gray-400" />;
}

function getReminderIcon(iconName: string, size: number = 14) {
  const props = { size };
  switch (iconName) {
    case 'cloud-rain': return <CloudRain {...props} />;
    case 'cloud-drizzle': return <CloudRain {...props} />;
    case 'umbrella': return <Umbrella {...props} />;
    case 'thermometer-sun': return <ThermometerSun {...props} />;
    case 'sun': return <SunIcon {...props} />;
    case 'snowflake': return <CloudSnow {...props} />;
    case 'thermometer-snow': return <ThermometerSnowflake {...props} />;
    case 'wind': return <WindIcon {...props} />;
    case 'mask': return <Shield {...props} />;
    case 'calendar-clock': return <CalendarClock {...props} />;
    case 'clock': return <Clock {...props} />;
    default: return <AlertTriangle {...props} />;
  }
}

export function WeatherCard({ item, onRefresh, refreshing }: WeatherCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dateCategory = classifyDate(item.date);
  const weather = item.weather;
  const daily = weather?.daily.find((d) => d.date === item.date);
  const airQuality = weather?.airQuality;
  const isMock = weather?.source === 'mock';
  const stale = isWeatherStale(item.weatherUpdatedAt);

  const reminders = generateReminders(daily, airQuality, dateCategory);

  // 过去日期
  if (dateCategory === 'past') {
    return (
      <div className="mt-2 px-3 py-2 bg-paper-100 rounded-paper text-xs text-gray-400 flex items-center gap-1.5">
        <Clock size={12} /> {getDateCategoryLabel(dateCategory)}，不查询天气
      </div>
    );
  }

  // 超过 15 天
  if (dateCategory === 'beyond') {
    return (
      <div className="mt-2 px-3 py-2 bg-paper-100 rounded-paper text-xs text-gray-500 flex items-center gap-1.5">
        <CalendarClock size={12} /> 暂不可预报，可临近日期再刷新
      </div>
    );
  }

  // 无天气数据
  if (!daily) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-gray-400">暂无天气数据</span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="text-xs text-dawn-500 hover:text-dawn-600 flex items-center gap-1"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? '查询中...' : '查询天气'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {/* 主天气卡片 */}
      <div className={`rounded-paper p-3 ${isMock ? 'bg-paper-50' : 'bg-dawn-50/50'} border border-paper-200`}>
        {/* 概况行 */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {getWeatherIcon(daily.codeDay)}
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-gray-800 text-lg leading-tight">
                  {daily.tempMax}°
                </span>
                <span className="text-sm text-gray-400">/ {daily.tempMin}°</span>
              </div>
              <span className="text-sm text-gray-600">{daily.textDay}</span>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-dawn-500 p-1"
            title="刷新天气"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 关键指标行 */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          {daily.precipProbability > 0 && (
            <span className="flex items-center gap-1">
              <Droplets size={11} className="text-rain-400" />
              降雨概率 {daily.precipProbability}%
              {daily.precip !== undefined && daily.precip > 0 && (
                <span className="text-gray-400">（{daily.precip}mm）</span>
              )}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Wind size={11} className="text-dawn-400" />
            {daily.windDir} {daily.windScale}级
            {daily.windSpeed && (
              <span className="text-gray-400">（{daily.windSpeed}km/h）</span>
            )}
          </span>
          {(() => {
            const uvLevel = getUvLevel(daily.uvIndex);
            if (!uvLevel) return null;
            return (
              <span className={`flex items-center gap-1 ${uvLevel.textColorClass}`}>
                <SunIcon size={11} />
                紫外线 {uvLevel.name}
                <span className="text-gray-400">（指数{daily.uvIndex}）</span>
              </span>
            );
          })()}
          {daily.humidity > 0 && (
            <span className="flex items-center gap-1">
              <Droplets size={11} />
              湿度 {daily.humidity}%
            </span>
          )}
          {stale && !isMock && (
            <span className="flex items-center gap-1 text-warm-500">
              <Clock size={11} /> 数据可能过期
            </span>
          )}
        </div>

        {/* 演示数据标识 */}
        {isMock && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-warm-500/10 text-warm-600 rounded-full text-[10px] font-medium">
            <AlertTriangle size={10} /> 演示数据
          </div>
        )}

        {/* 提醒卡片 */}
        {reminders.length > 0 && (
          <div className="mt-2 space-y-1">
            {reminders.map((r, i) => (
              <div
                key={i}
                className={`reminder-badge ${getReminderColorClass(r.level)}`}
              >
                {getReminderIcon(r.icon)}
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* 展开详情 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs text-dawn-500 hover:text-dawn-600"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? '收起详情' : '查看详情'}
        </button>

        {expanded && (
          <div className="mt-2 pt-2 border-t border-paper-200 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
            {daily.feelsLike !== undefined && (
              <span>体感温度: <span className="text-gray-700">{daily.feelsLike}°C</span></span>
            )}
            {(() => {
              const uvLevel = getUvLevel(daily.uvIndex);
              if (!uvLevel) return null;
              return (
                <span className={`col-span-2 ${uvLevel.textColorClass}`}>
                  紫外线{uvLevel.name}（指数{daily.uvIndex}）: {uvLevel.advice}
                </span>
              );
            })()}
            {daily.windSpeedNight && daily.windDirNight && (
              <span>夜间风力: <span className="text-gray-700">
                {daily.windDirNight} {daily.windScaleNight}级
                {daily.windSpeedNight && ` (${daily.windSpeedNight}km/h)`}
              </span></span>
            )}
            {daily.vis && (
              <span>能见度: <span className="text-gray-700">{daily.vis}km</span></span>
            )}
            {daily.pressure !== undefined && (
              <span className="flex items-center gap-1">
                <Gauge size={10} /> 气压: <span className="text-gray-700">{daily.pressure}hPa</span>
              </span>
            )}
            {airQuality && (
              <span className="flex items-center gap-1">
                <Eye size={10} /> AQI: <span className="text-gray-700">{airQuality.aqi} {airQuality.category}</span>
              </span>
            )}
            {weather?.updateTime && (
              <span className="col-span-2 text-gray-400 mt-1">
                数据更新: {new Date(weather.updateTime).toLocaleString('zh-CN')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
