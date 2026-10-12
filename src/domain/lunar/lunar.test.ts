import { describe, expect, it } from 'vitest';
import { addDays, plainDate, toYmd, type PlainDate } from '../date';
import { cnFestivalsOn, lunarDateOf, lunarToSolar, solarTermDate, solarTermOn } from './index';

const d = (s: string) => s as PlainDate;
const festivalIds = (s: string) => cnFestivalsOn(d(s)).map((f) => f.id);

describe('农历日期（测试锚点）', () => {
  it('2026 春节 2/17，除夕 2/16', () => {
    const newYear = lunarDateOf(d('2026-02-17'));
    expect(newYear).toMatchObject({ year: 2026, month: 1, day: 1, isLeapMonth: false });
    expect(newYear.monthName).toBe('正月');
    expect(newYear.dayName).toBe('初一');
    expect(newYear.yearGanzhi).toBe('丙午');
    expect(newYear.zodiac.fr).toBe('Cheval');

    const eve = lunarDateOf(d('2026-02-16'));
    expect(eve).toMatchObject({ year: 2025, month: 12, day: 29, monthName: '腊月' });
    expect(eve.yearGanzhi).toBe('乙巳');
  });

  it('2026 中秋 9/25；2026-10-13 是九月初四', () => {
    expect(lunarDateOf(d('2026-09-25'))).toMatchObject({ month: 8, day: 15 });
    expect(lunarDateOf(d('2026-10-13'))).toMatchObject({ monthName: '九月', dayName: '初四' });
  });

  it('闰月：2025 年闰六月', () => {
    const leap = lunarDateOf(d('2025-07-25'));
    expect(leap).toMatchObject({ month: 6, day: 1, isLeapMonth: true, monthName: '闰六月' });
    expect(lunarToSolar(2025, 6, 1, true)).toBe('2025-07-25');
  });

  it('冬月、腊月的叫法', () => {
    expect(lunarDateOf(d('2026-12-22')).monthName).toBe('冬月');
  });

  it('lunarToSolar 与 lunarDateOf 互逆', () => {
    for (const date of ['2026-02-17', '2026-06-19', '2027-01-01', '2024-02-09'].map(d)) {
      const l = lunarDateOf(date);
      expect(lunarToSolar(l.year, l.month, l.day, l.isLeapMonth)).toBe(date);
    }
  });
});

describe('节气', () => {
  it('2026 清明：4/5，北京时间 02:40（UTC 前一天 18:40）', () => {
    const term = solarTermOn(d('2026-04-05'));
    expect(term?.zh).toBe('清明');
    expect(term?.order).toBe(5);
    expect(term?.name.fr).toBe('Clarté pure');
    expect(term?.instant).toBe(Date.UTC(2026, 3, 4, 18, 40, 0));
  });

  it('2025 冬至：UTC 12/21 15:03:05', () => {
    expect(solarTermOn(d('2025-12-21'))?.instant).toBe(Date.UTC(2025, 11, 21, 15, 3, 5));
  });

  it('非交节日返回 undefined；每年恰好 24 个节气', () => {
    expect(solarTermOn(d('2026-10-13'))).toBeUndefined();
    let count = 0;
    for (let date = d('2026-01-01'); toYmd(date).year === 2026; date = addDays(date, 1)) {
      if (solarTermOn(date)) count++;
    }
    expect(count).toBe(24);
  });

  it('solarTermDate：年末冬至属于当年', () => {
    expect(solarTermDate(2026, '清明')).toBe('2026-04-05');
    expect(solarTermDate(2026, '小寒')).toBe('2026-01-05');
    expect(solarTermDate(2026, '冬至')).toBe('2026-12-22');
  });
});

describe('传统节日', () => {
  it('2026 年的节日', () => {
    expect(festivalIds('2026-02-17')).toEqual(['spring-festival']);
    expect(festivalIds('2026-09-25')).toEqual(['mid-autumn']);
    expect(festivalIds('2026-04-05')).toEqual(['qingming']);
    expect(festivalIds('2026-12-22')).toEqual(['dongzhi']);
    expect(festivalIds('2026-10-13')).toEqual([]);
    expect(cnFestivalsOn(lunarToSolar(2025, 12, 23)).map((f) => f.id)).toEqual(['xiaonian']);
  });

  it('除夕 = 正月初一前一天（腊月三十或廿九）', () => {
    expect(festivalIds('2024-02-09')).toContain('chuxi'); // 腊月三十
    expect(lunarDateOf(d('2024-02-09')).day).toBe(30);
    expect(festivalIds('2025-01-28')).toContain('chuxi'); // 腊月廿九
    expect(lunarDateOf(d('2025-01-28')).day).toBe(29);
    expect(festivalIds('2026-02-16')).toEqual(['chuxi']);
  });

  it('闰月里没有传统节日', () => {
    // 2023 年闰二月初二不是龙抬头
    expect(cnFestivalsOn(lunarToSolar(2023, 2, 2, true))).toEqual([]);
    // 2028 年闰五月初五不是端午，全年只有一个端午
    expect(cnFestivalsOn(lunarToSolar(2028, 5, 5, true))).toEqual([]);
    let dragonBoats = 0;
    for (let date = plainDate(2028, 1, 1); toYmd(date).year === 2028; date = addDays(date, 1)) {
      if (cnFestivalsOn(date).some((f) => f.id === 'dragon-boat')) dragonBoats++;
    }
    expect(dragonBoats).toBe(1);
  });
});
