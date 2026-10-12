// 现行《全国年节及纪念日放假办法》（2025-01-01 起施行）规定的法定节日本身。
// 只用于"安排尚未公布"的年份做提示，不含调休，不能当作放假安排。
import { addDays, plainDate, type PlainDate } from '../date';
import { lunarToSolar, solarTermDate } from '../lunar';
import type { CnHolidayId } from './types';

export const STATUTORY_RULES_SINCE = 2025;

export interface StatutoryDay {
  date: PlainDate;
  id: Exclude<CnHolidayId, 'other'>;
}

const cache = new Map<number, StatutoryDay[]>();

export function statutoryDaysOfYear(year: number): readonly StatutoryDay[] {
  let days = cache.get(year);
  if (days) return days;

  const springFestival = lunarToSolar(year, 1, 1);
  days = [
    { date: plainDate(year, 1, 1), id: 'new-year' },
    // 春节：农历除夕至正月初三
    ...[-1, 0, 1, 2].map((offset) => ({
      date: addDays(springFestival, offset),
      id: 'spring-festival' as const,
    })),
    { date: solarTermDate(year, '清明'), id: 'qingming' },
    { date: plainDate(year, 5, 1), id: 'labour-day' },
    { date: plainDate(year, 5, 2), id: 'labour-day' },
    { date: lunarToSolar(year, 5, 5), id: 'dragon-boat' },
    { date: lunarToSolar(year, 8, 15), id: 'mid-autumn' },
    { date: plainDate(year, 10, 1), id: 'national-day' },
    { date: plainDate(year, 10, 2), id: 'national-day' },
    { date: plainDate(year, 10, 3), id: 'national-day' },
  ];
  cache.set(year, days);
  return days;
}
