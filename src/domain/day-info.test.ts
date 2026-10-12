import { describe, expect, it } from 'vitest';
import { CN_LAST_PUBLISHED_YEAR, statutoryDaysOfYear } from './cn-holidays';
import type { PlainDate } from './date';
import { ALL_LAYERS, cellLabel, getDayInfo, getMonthInfo, type DaySettings } from './day-info';

const d = (s: string) => s as PlainDate;
const metropole: DaySettings = { frZone: 'metropole' };
const info = (s: string, settings = metropole) => getDayInfo(d(s), settings);
const label = (s: string, layers = ALL_LAYERS) => cellLabel(info(s), layers);

describe('getDayInfo', () => {
  it('中国国庆：休', () => {
    const day = info('2026-10-01');
    expect(day.weekday).toBe(4);
    expect(day.cnHoliday?.kind).toBe('off');
    expect(day.cnHoliday?.names[0]?.fr).toBe('Fête nationale (Chine)');
    expect(day.frHolidays).toEqual([]);
    expect(day.cnYearStatus).toBe('published');
  });

  it('补班日：班', () => {
    expect(info('2026-02-14').cnHoliday?.kind).toBe('work');
  });

  it('中法同一天放假：2026-04-06 清明假期 + Lundi de Pâques', () => {
    const day = info('2026-04-06');
    expect(day.cnHoliday?.kind).toBe('off');
    expect(day.frHolidays.map((h) => h.id)).toEqual(['lundi-de-paques']);
  });

  it('法国地区设置生效', () => {
    expect(info('2026-12-26').frHolidays).toEqual([]);
    expect(info('2026-12-26', { frZone: 'alsace-moselle' }).frHolidays[0]?.id).toBe(
      'saint-etienne',
    );
  });

  it('节气与节日', () => {
    const day = info('2026-04-05');
    expect(day.solarTerm?.zh).toBe('清明');
    expect(day.cnFestivals.map((f) => f.id)).toEqual(['qingming']);
    expect(info('2026-10-13').solarTerm).toBeUndefined();
  });

  it('安排未公布的年份：只标法定节日', () => {
    const next = CN_LAST_PUBLISHED_YEAR + 1;
    const midAutumn = statutoryDaysOfYear(next).find((x) => x.id === 'mid-autumn')!.date;
    const day = getDayInfo(midAutumn, metropole);
    expect(day.cnYearStatus).toBe('unpublished');
    expect(day.cnHoliday?.kind).toBe('statutory-unpublished');
    expect(day.cnHoliday?.names.map((n) => n.zh)).toContain('中秋节');
  });

  it('无数据的年份没有中国假日标记', () => {
    const day = info('2019-10-01');
    expect(day.cnYearStatus).toBe('unavailable');
    expect(day.cnHoliday).toBeUndefined();
  });
});

describe('getMonthInfo', () => {
  it('2026 年 10 月：42 天，从 9/28 周一开始', () => {
    const month = getMonthInfo({ year: 2026, month: 10 }, metropole);
    expect(month).toHaveLength(42);
    expect(month[0]?.date).toBe('2026-09-28');
    expect(month[0]?.cnHoliday).toBeUndefined();
    expect(month[3]?.cnHoliday?.kind).toBe('off');
  });
});

describe('cellLabel 优先级', () => {
  it('节日 > 节气 > 月首 > 日', () => {
    expect(label('2026-02-17')).toEqual({ text: '春节', kind: 'festival' });
    expect(label('2026-04-05')).toEqual({ text: '清明', kind: 'festival' });
    expect(label('2026-10-08')).toEqual({ text: '寒露', kind: 'term' });
    expect(label('2026-10-10')).toEqual({ text: '九月', kind: 'month' });
    expect(label('2026-10-13')).toEqual({ text: '初四', kind: 'day' });
  });

  it('关闭图层后降级显示', () => {
    const noFestivals = { ...ALL_LAYERS, festivals: false };
    expect(label('2026-02-17', noFestivals)).toEqual({ text: '正月', kind: 'month' });
    expect(label('2026-04-05', noFestivals)).toEqual({ text: '清明', kind: 'term' });
    const nothing = { ...ALL_LAYERS, festivals: false, solarTerms: false, lunar: false };
    expect(label('2026-10-13', nothing)).toBeUndefined();
  });
});
