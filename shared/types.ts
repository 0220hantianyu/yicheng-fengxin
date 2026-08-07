/** 行程到达时段 */
export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'allday' | 'unknown';

/** 日期分类（决定天气查询行为） */
export type DateCategory = 'past' | 'near' | 'far' | 'beyond';

/** 地点信息 */
export interface GeoLocation {
  /** 显示名称，如 "北京市东城区" */
  displayName: string;
  /** 和风天气 Location ID */
  locationId: string;
  /** 纬度 */
  lat: string;
  /** 经度 */
  lon: string;
  /** 一级行政区，如 "北京市" */
  adm1: string;
  /** 二级行政区，如 "东城区" */
  adm2: string;
  /** 国家 */
  country: string;
}

/** 行程项 */
export interface ItineraryItem {
  id: string;
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 城市 */
  city: string;
  /** 区县（可选） */
  district?: string;
  /** 到达时段 */
  timeSlot: TimeSlot;
  /** 备注（可选） */
  note?: string;
  /** 地点信息（确认后保存） */
  location?: GeoLocation;
  /** 天气数据缓存 */
  weather?: WeatherData;
  /** 天气数据最后更新时间 ISO */
  weatherUpdatedAt?: string;
  /** 日期是否由 OCR 自动推断（需要用户确认） */
  datePending?: boolean;
}

/** 天气日预报数据 */
export interface WeatherDaily {
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 白天天气描述 */
  textDay: string;
  /** 夜间天气描述 */
  textNight: string;
  /** 天气代码（白天） */
  codeDay: string;
  /** 天气代码（夜间） */
  codeNight: string;
  /** 最高温 */
  tempMax: number;
  /** 最低温 */
  tempMin: number;
  /** 降雨概率 0-100（来自 hourly API 的 pop 字段） */
  precipProbability: number;
  /** 降水量 mm（来自 daily API 的 precip 字段） */
  precip?: number;
  /** 风速 km/h */
  windSpeed: string;
  /** 风力等级 */
  windScale: string;
  /** 风向 */
  windDir: string;
  /** 夜间风速 km/h */
  windSpeedNight?: string;
  /** 夜间风力等级 */
  windScaleNight?: string;
  /** 夜间风向 */
  windDirNight?: string;
  /** 湿度 % */
  humidity: number;
  /** 紫外线指数 */
  uvIndex?: string;
  /** 体感温度 */
  feelsLike?: number;
  /** 能见度 km */
  vis?: string;
  /** 气压 hPa */
  pressure?: number;
}

/** 空气质量数据 */
export interface AirQualityData {
  /** AQI */
  aqi: number;
  /** 等级 */
  category: string;
  /** PM2.5 */
  pm2p5: number;
  /** PM10 */
  pm10: number;
  /** 主要污染物 */
  primary: string;
}

/** 完整天气数据 */
export interface WeatherData {
  /** 日预报列表 */
  daily: WeatherDaily[];
  /** 空气质量（如果有） */
  airQuality?: AirQualityData;
  /** 数据来源标识 */
  source: 'qweather' | 'mock';
  /** 更新时间 ISO */
  updateTime: string;
}

/** 天气提醒 */
export interface WeatherReminder {
  /** 提醒类型 */
  type: 'rain' | 'highTemp' | 'lowTemp' | 'wind' | 'airQuality' | 'trend' | 'uv' | 'info';
  /** 提醒级别 */
  level: 'info' | 'warning' | 'danger';
  /** 提醒文案 */
  message: string;
  /** 对应图标名 */
  icon: string;
}

/** 地点搜索结果 */
export interface GeoSearchResult {
  name: string;
  id: string;
  lat: string;
  lon: string;
  adm1: string;
  adm2: string;
  country: string;
}

/** OCR 识别结果 */
export interface OcrResult {
  /** 原始文本 */
  rawText: string;
  /** 解析出的待确认行程项 */
  candidates: ItineraryItem[];
}

/** 旅行行程 */
export interface Trip {
  id: string;
  name: string;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}
