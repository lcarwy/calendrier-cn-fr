import { describe, expect, it } from 'vitest';
import type { PlainDate } from '../date';
import { easterSunday, frHolidaysOfYear, frHolidaysOn, FR_ZONES, type FrZone } from './index';
import alsaceMoselle from './fixtures/alsace-moselle.json';
import metropole from './fixtures/metropole.json';

// 官方数据集 calendrier.api.gouv.fr（Licence Ouverte），键为日期
const OFFICIAL: Record<FrZone, Record<string, string>> = {
  metropole,
  'alsace-moselle': alsaceMoselle,
};

describe('复活节', () => {
  it('已知年份', () => {
    expect(easterSunday(2008)).toBe('2008-03-23');
    expect(easterSunday(2024)).toBe('2024-03-31');
    expect(easterSunday(2025)).toBe('2025-04-20');
    expect(easterSunday(2026)).toBe('2026-04-05');
    expect(easterSunday(2027)).toBe('2027-03-28');
    expect(easterSunday(2038)).toBe('2038-04-25'); // 最晚可能日期
    expect(easterSunday(2285)).toBe('2285-03-22'); // 最早可能日期
  });
});

describe('与官方数据集逐年比对', () => {
  for (const zone of FR_ZONES) {
    const byYear = new Map<number, string[]>();
    for (const date of Object.keys(OFFICIAL[zone])) {
      const year = Number(date.slice(0, 4));
      byYear.set(year, [...(byYear.get(year) ?? []), date]);
    }

    it(`${zone}：${byYear.size} 年的日期完全一致`, () => {
      expect(byYear.size).toBeGreaterThan(20);
      for (const [year, officialDates] of byYear) {
        const ours = [...new Set(frHolidaysOfYear(year, zone).map((h) => h.date))];
        expect(ours, `${zone} ${year}`).toEqual([...officialDates].sort());
      }
    });
  }
});

describe('规则细节', () => {
  it('2026 年移动假日', () => {
    const ids = Object.fromEntries(
      frHolidaysOfYear(2026, 'metropole').map((h) => [h.id, h.date] as const),
    );
    expect(ids['lundi-de-paques']).toBe('2026-04-06');
    expect(ids['ascension']).toBe('2026-05-14');
    expect(ids['lundi-de-pentecote']).toBe('2026-05-25');
  });

  it('本土 11 天，Alsace-Moselle 13 天', () => {
    expect(frHolidaysOfYear(2026, 'metropole')).toHaveLength(11);
    expect(frHolidaysOfYear(2026, 'alsace-moselle')).toHaveLength(13);
    expect(frHolidaysOn('2026-12-26' as PlainDate, 'metropole')).toEqual([]);
    expect(frHolidaysOn('2026-12-26' as PlainDate, 'alsace-moselle')[0]?.id).toBe('saint-etienne');
    expect(frHolidaysOn('2026-04-03' as PlainDate, 'alsace-moselle')[0]?.id).toBe('vendredi-saint');
  });

  it('同一天两个假日都保留（2008-05-01 = Fête du Travail + Ascension）', () => {
    const ids = frHolidaysOn('2008-05-01' as PlainDate, 'metropole').map((h) => h.id);
    expect(ids.sort()).toEqual(['ascension', 'fete-du-travail']);
  });

  it('只有 5 月 1 日是法定必须休息；圣灵降临节星期一标记为 solidarité', () => {
    const holidays = frHolidaysOfYear(2026, 'metropole');
    expect(holidays.filter((h) => h.mandatoryOff).map((h) => h.id)).toEqual(['fete-du-travail']);
    expect(holidays.filter((h) => h.solidarityDay).map((h) => h.id)).toEqual([
      'lundi-de-pentecote',
    ]);
  });
});
