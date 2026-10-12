import { describe, expect, it } from 'vitest';
import { addDays, isPlainDate, weekday, type PlainDate } from '../date';
import {
  CN_FIRST_DATA_YEAR,
  CN_LAST_PUBLISHED_YEAR,
  cnHolidayDayOn,
  cnStatutoryIdsOn,
  cnYearStatus,
  loadedCnHolidayFiles,
  statutoryDaysOfYear,
} from './index';

const d = (s: string) => s as PlainDate;
const kindOf = (s: string) => cnHolidayDayOn(d(s))?.kind;

function range(from: string, to: string): PlainDate[] {
  const out: PlainDate[] = [];
  for (let day = d(from); day <= to; day = addDays(day, 1)) out.push(day);
  return out;
}

describe('2026 年国务院安排（测试锚点）', () => {
  it('春节：2/15–2/23 休，2/14、2/28 班', () => {
    expect(range('2026-02-15', '2026-02-23').map((x) => kindOf(x))).toEqual(Array(9).fill('off'));
    expect(kindOf('2026-02-14')).toBe('work');
    expect(kindOf('2026-02-28')).toBe('work');
    expect(cnHolidayDayOn(d('2026-02-17'))?.names[0]?.fr).toBe('Nouvel An chinois');
  });

  it('国庆：10/1–10/7 休，9/20、10/10 班', () => {
    expect(range('2026-10-01', '2026-10-07').map((x) => kindOf(x))).toEqual(Array(7).fill('off'));
    expect(kindOf('2026-09-20')).toBe('work');
    expect(kindOf('2026-10-10')).toBe('work');
  });

  it('普通日子没有标记', () => {
    expect(cnHolidayDayOn(d('2026-10-13'))).toBeUndefined();
  });
});

describe('中秋国庆连休拆成两个节日', () => {
  it('2025-10-01', () => {
    const day = cnHolidayDayOn(d('2025-10-01'));
    expect(day?.ids).toEqual(['national-day', 'mid-autumn']);
    expect(day?.names.map((n) => n.zh)).toEqual(['国庆节', '中秋节']);
  });
});

describe('年份状态', () => {
  it('已公布 / 未公布 / 无数据', () => {
    expect(CN_FIRST_DATA_YEAR).toBe(2020);
    expect(cnYearStatus(2026)).toBe('published');
    expect(cnYearStatus(CN_LAST_PUBLISHED_YEAR + 1)).toBe('unpublished');
    expect(cnYearStatus(2019)).toBe('unavailable');
  });
});

describe('数据文件完整性', () => {
  const files = loadedCnHolidayFiles();

  it('从 2020 年起每年都有文件，且年份连续', () => {
    const years = files.map((f) => f.year).sort();
    expect(years[0]).toBe(2020);
    expect(years).toEqual(years.map((_, i) => 2020 + i));
  });

  it('日期合法、跨文件不重复、补班都在周末、都有 gov.cn 原文', () => {
    const seen = new Set<string>();
    for (const file of files) {
      expect(file.papers.length, `${file.year} papers`).toBeGreaterThan(0);
      for (const paper of file.papers) expect(new URL(paper).hostname).toMatch(/(^|\.)gov\.cn$/);
      for (const entry of file.days) {
        expect(isPlainDate(entry.date), entry.date).toBe(true);
        expect(seen.has(entry.date), `重复 ${entry.date}`).toBe(false);
        seen.add(entry.date);
        if (entry.kind === 'work')
          expect(weekday(entry.date as PlainDate)).toBeGreaterThanOrEqual(6);
      }
    }
  });
});

describe('现行放假办法的法定节日（2025 年起，13 天）', () => {
  it('2026 年的 13 天', () => {
    const days = statutoryDaysOfYear(2026);
    expect(days).toHaveLength(13);
    expect(days.filter((x) => x.id === 'spring-festival').map((x) => x.date)).toEqual([
      '2026-02-16',
      '2026-02-17',
      '2026-02-18',
      '2026-02-19',
    ]);
    const single = (id: string) => days.find((x) => x.id === id)?.date;
    expect(single('qingming')).toBe('2026-04-05');
    expect(single('dragon-boat')).toBe('2026-06-19');
    expect(single('mid-autumn')).toBe('2026-09-25');
  });

  it('已公布年份（2025 起）的数据必须让每个法定节日都放假', () => {
    for (let year = 2025; year <= CN_LAST_PUBLISHED_YEAR; year++) {
      for (const { date, id } of statutoryDaysOfYear(year)) {
        expect(cnHolidayDayOn(date)?.kind, `${year} ${id} ${date}`).toBe('off');
      }
    }
  });

  it('只在"未公布"的年份给出法定节日提示', () => {
    const next = CN_LAST_PUBLISHED_YEAR + 1;
    const midAutumn = statutoryDaysOfYear(next).find((x) => x.id === 'mid-autumn')!.date;
    expect(cnStatutoryIdsOn(midAutumn)).toContain('mid-autumn');
    expect(cnStatutoryIdsOn(d('2026-09-25'))).toEqual([]);
    expect(cnStatutoryIdsOn(d('2019-10-01'))).toEqual([]);
  });
});
