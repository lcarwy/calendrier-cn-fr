import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  isLeapYear,
  isoWeek,
  isPlainDate,
  monthGrid,
  parsePlainDate,
  plainDate,
  today,
  weekday,
  type PlainDate,
} from './index';

const d = (s: string) => s as PlainDate;

describe('闰年与月份天数', () => {
  it('世纪年规则', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2026)).toBe(false);
  });

  it('二月天数', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe('构造与解析', () => {
  it('补零', () => {
    expect(plainDate(2026, 1, 5)).toBe('2026-01-05');
  });

  it('非法日期抛错', () => {
    expect(() => plainDate(2026, 2, 29)).toThrow(RangeError);
    expect(() => plainDate(2026, 13, 1)).toThrow(RangeError);
  });

  it('parsePlainDate 只接受合法日期', () => {
    expect(parsePlainDate('2024-02-29')).toBe('2024-02-29');
    expect(parsePlainDate('2026-02-29')).toBeUndefined();
    expect(parsePlainDate('2026-2-1')).toBeUndefined();
    expect(parsePlainDate('2026-10-13T00:00')).toBeUndefined();
    expect(isPlainDate('2026-10-13')).toBe(true);
    expect(isPlainDate(20261013)).toBe(false);
  });
});

describe('日期运算', () => {
  it('跨月、跨年、闰日', () => {
    expect(addDays(d('2026-01-31'), 1)).toBe('2026-02-01');
    expect(addDays(d('2026-12-31'), 1)).toBe('2027-01-01');
    expect(addDays(d('2024-02-28'), 1)).toBe('2024-02-29');
    expect(addDays(d('2026-03-01'), -1)).toBe('2026-02-28');
  });

  it('跨越法国夏令时切换不会多算或少算一天', () => {
    // 2026-03-29 和 2026-10-25 是夏令时切换日
    expect(addDays(d('2026-03-28'), 2)).toBe('2026-03-30');
    expect(addDays(d('2026-10-24'), 2)).toBe('2026-10-26');
    expect(diffDays(d('2026-01-01'), d('2027-01-01'))).toBe(365);
  });

  it('星期', () => {
    expect(weekday(d('1970-01-01'))).toBe(4);
    expect(weekday(d('2026-10-13'))).toBe(2);
    expect(weekday(d('2026-02-01'))).toBe(7);
    expect(weekday(d('1969-12-29'))).toBe(1);
  });

  it('addMonths', () => {
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths({ year: 2026, month: 10 }, -22)).toEqual({ year: 2024, month: 12 });
  });
});

describe('ISO 周', () => {
  it('年初年末的边界', () => {
    expect(isoWeek(d('2026-01-01'))).toEqual({ year: 2026, week: 1 });
    expect(isoWeek(d('2026-10-13'))).toEqual({ year: 2026, week: 42 });
    expect(isoWeek(d('2026-12-31'))).toEqual({ year: 2026, week: 53 });
    expect(isoWeek(d('2027-01-03'))).toEqual({ year: 2026, week: 53 });
    expect(isoWeek(d('2027-01-04'))).toEqual({ year: 2027, week: 1 });
    expect(isoWeek(d('2024-12-30'))).toEqual({ year: 2025, week: 1 });
  });
});

describe('月视图', () => {
  it('固定 42 天，从周一开始', () => {
    const grid = monthGrid({ year: 2026, month: 2 });
    expect(grid).toHaveLength(42);
    expect(grid[0]).toBe('2026-01-26');
    expect(grid[41]).toBe('2026-03-08');
    expect(grid.every((date, i) => weekday(date) === (i % 7) + 1)).toBe(true);
  });

  it('1 日恰好是周一时从 1 日开始', () => {
    expect(monthGrid({ year: 2026, month: 6 })[0]).toBe('2026-06-01');
  });
});

describe('today', () => {
  it('使用设备本地日期', () => {
    expect(today(new Date(2026, 9, 13, 23, 59))).toBe('2026-10-13');
    expect(today(new Date(2026, 9, 14, 0, 1))).toBe('2026-10-14');
  });
});
