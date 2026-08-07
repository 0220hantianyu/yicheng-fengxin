import type { TimeSlot } from '../../../shared/types';

/**
 * 到达时段排序权重
 */
const TIME_SLOT_ORDER: Record<TimeSlot, number> = {
  allday: 0,
  morning: 1,
  afternoon: 2,
  evening: 3,
  unknown: 4,
};

/**
 * 到达时段中文标签
 */
export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '上午',
  afternoon: '下午',
  evening: '晚上',
  allday: '全天',
  unknown: '不确定',
};

/**
 * 对行程项按日期和时段排序
 */
export function sortItineraryItems<T extends { date: string; timeSlot: TimeSlot }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // 先按日期排序
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // 同一天按时段排序
    return TIME_SLOT_ORDER[a.timeSlot] - TIME_SLOT_ORDER[b.timeSlot];
  });
}

/**
 * 按日期分组
 */
export function groupByDate<T extends { date: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    if (!groups.has(item.date)) {
      groups.set(item.date, []);
    }
    groups.get(item.date)!.push(item);
  }
  return groups;
}
