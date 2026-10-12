// 中国法定节假日与调休：只使用国务院公布的数据（src/data/cn-holidays/），绝不推算调休。
import { toYmd, type PlainDate } from '../date';
import type { LocalizedText } from '../text';
import { cnHolidayName } from './names';
import { STATUTORY_RULES_SINCE, statutoryDaysOfYear } from './statutory';
import type { CnDayKind, CnHolidayFile, CnHolidayId } from './types';

export type { CnDayKind, CnHolidayFile, CnHolidayId } from './types';
export { CN_HOLIDAY_NAMES, cnHolidayName } from './names';
export { statutoryDaysOfYear } from './statutory';

export interface CnHolidayDay {
  date: PlainDate;
  kind: CnDayKind;
  ids: CnHolidayId[];
  names: LocalizedText[];
  /** 该安排所属的通知年份及原文链接 */
  noticeYear: number;
  papers: string[];
}

export type CnYearStatus = 'published' | 'unpublished' | 'unavailable';

const files = import.meta.glob<CnHolidayFile>('../../data/cn-holidays/*.json', {
  eager: true,
  import: 'default',
});

const byDate = new Map<PlainDate, CnHolidayDay>();
const publishedYears = new Set<number>();

// 通知年份 ≠ 日期年份（如上一年 12 月的补班），所以合并成一个按日期的索引
for (const file of Object.values(files)) {
  publishedYears.add(file.year);
  for (const entry of file.days) {
    byDate.set(entry.date as PlainDate, {
      date: entry.date as PlainDate,
      kind: entry.kind,
      ids: entry.ids,
      names: entry.ids.map((id) => cnHolidayName(id, entry.name)),
      noticeYear: file.year,
      papers: file.papers,
    });
  }
}

export const CN_FIRST_DATA_YEAR = Math.min(...publishedYears);
export const CN_LAST_PUBLISHED_YEAR = Math.max(...publishedYears);

/** 某天的放假/补班安排；普通日子返回 undefined */
export function cnHolidayDayOn(date: PlainDate): CnHolidayDay | undefined {
  return byDate.get(date);
}

/**
 * published：已有国务院安排
 * unpublished：在最新数据之后，安排尚未公布
 * unavailable：早于数据起始年份
 */
export function cnYearStatus(year: number): CnYearStatus {
  if (publishedYears.has(year)) return 'published';
  return year > CN_LAST_PUBLISHED_YEAR ? 'unpublished' : 'unavailable';
}

export function cnYearStatusOf(date: PlainDate): CnYearStatus {
  return cnYearStatus(toYmd(date).year);
}

/**
 * 安排尚未公布的年份：按现行放假办法返回当天的法定节日（不含调休）。
 * 已公布或无数据的年份返回空数组。
 */
export function cnStatutoryIdsOn(date: PlainDate): CnHolidayId[] {
  const { year } = toYmd(date);
  if (cnYearStatus(year) !== 'unpublished' || year < STATUTORY_RULES_SINCE) return [];
  return statutoryDaysOfYear(year)
    .filter((d) => d.date === date)
    .map((d) => d.id);
}

/** 测试用：遍历所有已加载的数据文件 */
export function loadedCnHolidayFiles(): CnHolidayFile[] {
  return Object.values(files);
}
