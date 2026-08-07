/**
 * 紫外线指数等级工具
 * 基于 WHO（世界卫生组织）UV Index 标准
 * https://www.who.int/uv/intersunprogramme/activities/uv_index/
 *
 * 等级划分：
 * 0-2:  弱     - 无需特别防护
 * 3-5:  中等   - 建议涂防晒霜(SPF30+)，戴帽子
 * 6-7:  强     - 必须防晒，戴帽子和太阳镜，减少正午外出
 * 8-10: 很强   - 尽量避免正午户外，SPF50+，长袖衣物
 * 11+:  极强   - 避免户外活动，全方位防护
 */

export interface UvLevel {
  /** 等级名称（中文） */
  name: string;
  /** 等级名称（英文） */
  nameEn: string;
  /** 颜色类名（Tailwind） */
  colorClass: string;
  /** 背景色类名 */
  bgClass: string;
  /** 文字颜色类名 */
  textColorClass: string;
  /** 防晒建议 */
  advice: string;
  /** 提醒级别 */
  level: 'info' | 'warning' | 'danger';
}

/**
 * 根据 UV 指数获取等级信息
 */
export function getUvLevel(uvIndexStr: string | undefined): UvLevel | null {
  if (!uvIndexStr) return null;
  const uv = parseInt(uvIndexStr, 10);
  if (isNaN(uv)) return null;

  if (uv <= 2) {
    return {
      name: '弱',
      nameEn: 'Low',
      colorClass: 'text-green-500',
      bgClass: 'bg-green-500/10',
      textColorClass: 'text-green-600',
      advice: '紫外线较弱，一般无需特别防护',
      level: 'info',
    };
  }
  if (uv <= 5) {
    return {
      name: '中等',
      nameEn: 'Moderate',
      colorClass: 'text-yellow-600',
      bgClass: 'bg-yellow-500/10',
      textColorClass: 'text-yellow-700',
      advice: '紫外线中等，外出建议涂SPF30+防晒霜，戴帽子',
      level: 'info',
    };
  }
  if (uv <= 7) {
    return {
      name: '强',
      nameEn: 'High',
      colorClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
      textColorClass: 'text-orange-600',
      advice: '紫外线强，必须涂SPF50+防晒霜，戴宽檐帽和太阳镜，尽量避免10-14点正午外出',
      level: 'warning',
    };
  }
  if (uv <= 10) {
    return {
      name: '很强',
      nameEn: 'Very High',
      colorClass: 'text-red-500',
      bgClass: 'bg-red-500/10',
      textColorClass: 'text-red-600',
      advice: '紫外线很强，尽量减少户外活动。如需外出，SPF50+防晒霜、长袖衣物、太阳镜、遮阳伞缺一不可，每2小时补涂',
      level: 'warning',
    };
  }
  return {
    name: '极强',
    nameEn: 'Extreme',
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-500/10',
    textColorClass: 'text-purple-600',
    advice: '紫外线极强，尽量避免户外活动。如必须外出，全方位严密防护，频繁补涂防晒霜',
    level: 'danger',
  };
}

/**
 * 获取 UV 指数的简短描述（用于摘要文本）
 */
export function getUvShortText(uvIndexStr: string | undefined): string {
  const level = getUvLevel(uvIndexStr);
  if (!level) return '';
  return `紫外线${level.name}`;
}
