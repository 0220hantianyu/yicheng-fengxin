import { describe, it, expect } from 'vitest';
import { classifyDate, daysBetween, isWeatherStale } from '../date';

describe('classifyDate', () => {
  // 固定"当前时间"为 2026-08-06
  const now = new Date('2026-08-06T12:00:00');

  it('过去日期应分类为 past', () => {
    expect(classifyDate('2026-08-05', now)).toBe('past');
    expect(classifyDate('2026-07-01', now)).toBe('past');
    expect(classifyDate('2025-12-31', now)).toBe('past');
  });

  it('未来 1-7 天应分类为 near', () => {
    expect(classifyDate('2026-08-06', now)).toBe('near'); // 今天
    expect(classifyDate('2026-08-07', now)).toBe('near'); // 明天
    expect(classifyDate('2026-08-12', now)).toBe('near'); // 6天后
    expect(classifyDate('2026-08-13', now)).toBe('near'); // 7天后
  });

  it('未来 8-15 天应分类为 far', () => {
    expect(classifyDate('2026-08-14', now)).toBe('far'); // 8天后
    expect(classifyDate('2026-08-20', now)).toBe('far'); // 14天后
    expect(classifyDate('2026-08-21', now)).toBe('far'); // 15天后
  });

  it('超过 15 天应分类为 beyond', () => {
    expect(classifyDate('2026-08-22', now)).toBe('beyond'); // 16天后
    expect(classifyDate('2026-09-06', now)).toBe('beyond'); // 1个月后
    expect(classifyDate('2027-01-01', now)).toBe('beyond'); // 明年
  });

  it('边界值测试', () => {
    // 第7天 = near
    expect(classifyDate('2026-08-13', now)).toBe('near');
    // 第8天 = far
    expect(classifyDate('2026-08-14', now)).toBe('far');
    // 第15天 = far
    expect(classifyDate('2026-08-21', now)).toBe('far');
    // 第16天 = beyond
    expect(classifyDate('2026-08-22', now)).toBe('beyond');
  });
});

describe('daysBetween', () => {
  it('同一天差为 0', () => {
    const d = new Date('2026-08-06');
    expect(daysBetween(d, d)).toBe(0);
  });

  it('正确计算天数差', () => {
    const base = new Date('2026-08-06');
    const future = new Date('2026-08-10');
    expect(daysBetween(base, future)).toBe(4);
  });

  it('过去日期返回负数', () => {
    const base = new Date('2026-08-06');
    const past = new Date('2026-08-01');
    expect(daysBetween(base, past)).toBe(-5);
  });
});

describe('isWeatherStale', () => {
  it('没有更新时间时应返回 true', () => {
    expect(isWeatherStale(undefined)).toBe(true);
    expect(isWeatherStale('')).toBe(true);
  });

  it('6小时内应返回 false', () => {
    const recent = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(); // 3小时前
    expect(isWeatherStale(recent)).toBe(false);
  });

  it('超过6小时应返回 true', () => {
    const old = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(); // 7小时前
    expect(isWeatherStale(old)).toBe(true);
  });

  it('自定义过期时间', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(isWeatherStale(twoHoursAgo, 1)).toBe(true); // 1小时过期
    expect(isWeatherStale(twoHoursAgo, 3)).toBe(false); // 3小时过期
  });
});
