import type { DateCategory } from '../../../shared/types';

/**
 * 计算两个日期之间的天数差（基于日期，忽略时间）
 * @returns 正数表示 target 在 base 之后，负数表示之前
 */
export function daysBetween(base: Date, target: Date): number {
  const baseDate = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = targetDate.getTime() - baseDate.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * 日期分类逻辑
 * - past: 过去日期
 * - near: 未来 1-7 天
 * - far: 未来 8-15 天
 * - beyond: 超过 15 天
 */
export function classifyDate(dateStr: string, now: Date = new Date()): DateCategory {
  const target = new Date(dateStr + 'T00:00:00');
  const diff = daysBetween(now, target);

  if (diff < 0) return 'past';
  if (diff <= 7) return 'near';
  if (diff <= 15) return 'far';
  return 'beyond';
}

/**
 * 获取日期分类的中文描述
 */
export function getDateCategoryLabel(category: DateCategory): string {
  const labels: Record<DateCategory, string> = {
    past: '历史行程',
    near: '未来 1-7 天',
    far: '未来 8-15 天',
    beyond: '超过 15 天',
  };
  return labels[category];
}

/**
 * 格式化日期为中文显示
 */
export function formatDateChinese(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 周${weekday}`;
}

/**
 * 格式化日期为短显示（月/日）
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 获取今天日期字符串 YYYY-MM-DD
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 检查天气数据是否过期（超过 6 小时）
 */
export function isWeatherStale(updatedAt: string | undefined, staleHours: number = 6): boolean {
  if (!updatedAt) return true;
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  return diffMs > staleHours * 60 * 60 * 1000;
}
