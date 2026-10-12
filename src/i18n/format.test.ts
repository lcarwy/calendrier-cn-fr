import { describe, expect, it } from 'vitest';
import type { PlainDate } from '../domain/date';
import {
  formatInstant,
  formatLongDate,
  formatMonthYear,
  MONTH_NAMES,
  ordinal,
  WEEKDAY_SHORT_NAMES,
} from './format';
import { t } from './index';

describe('法语日期格式', () => {
  it('长日期、月份标题', () => {
    expect(formatLongDate('2026-10-13' as PlainDate)).toBe('mardi 13 octobre 2026');
    expect(formatMonthYear({ year: 2026, month: 10 })).toBe('octobre 2026');
  });

  it('月份和星期名称，周一开头', () => {
    expect(MONTH_NAMES[0]).toBe('janvier');
    expect(MONTH_NAMES[11]).toBe('décembre');
    expect(WEEKDAY_SHORT_NAMES[0]).toBe('lun.');
    expect(WEEKDAY_SHORT_NAMES[6]).toBe('dim.');
  });

  it('同一时刻在北京和巴黎可能是不同的日期（2026 清明）', () => {
    const instant = Date.UTC(2026, 3, 4, 18, 40);
    expect(formatInstant(instant, 'Asia/Shanghai')).toBe('5 avril à 02:40');
    expect(formatInstant(instant, 'Europe/Paris')).toBe('4 avril à 20:40');
  });

  it('序数词', () => {
    expect(ordinal(1)).toBe('1er');
    expect(ordinal(9)).toBe('9ᵉ');
  });
});

describe('t() 插值', () => {
  it('替换占位符，未提供的保持原样', () => {
    expect(t('detail.week', { week: 42 })).toBe('Semaine 42');
    expect(t('detail.week')).toBe('Semaine {week}');
  });
});
