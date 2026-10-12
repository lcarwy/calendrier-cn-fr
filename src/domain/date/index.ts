// 日历日期工具。所有日期都是"无时区"的 'YYYY-MM-DD'。
// 内部用 Date.UTC / getUTC* 做运算，避免本地时区和夏令时把日期挪一天。
// 禁止 new Date('YYYY-MM-DD') 和 toISOString()（见 CLAUDE.md §8）。

/** 无时区的日历日期，格式 'YYYY-MM-DD' */
export type PlainDate = string & { readonly __brand: 'PlainDate' };

/** ISO 星期：1 = 周一 … 7 = 周日 */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export interface Ymd extends YearMonth {
  day: number;
}

const MS_PER_DAY = 86_400_000;
const PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31;
}

function isValidYmd(year: number, month: number, day: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    year >= 1000 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export function plainDate(year: number, month: number, day: number): PlainDate {
  if (!isValidYmd(year, month, day)) {
    throw new RangeError(`Invalid date: ${year}-${month}-${day}`);
  }
  return `${year}-${pad2(month)}-${pad2(day)}` as PlainDate;
}

/** 校验并转换字符串；格式或日期不合法时返回 undefined */
export function parsePlainDate(value: string): PlainDate | undefined {
  const match = PATTERN.exec(value);
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return isValidYmd(year, month, day) ? (value as PlainDate) : undefined;
}

export function isPlainDate(value: unknown): value is PlainDate {
  return typeof value === 'string' && parsePlainDate(value) !== undefined;
}

export function toYmd(date: PlainDate): Ymd {
  return {
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
    day: Number(date.slice(8, 10)),
  };
}

/** 距 1970-01-01 的天数 */
export function toDayNumber(date: PlainDate): number {
  const { year, month, day } = toYmd(date);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

export function fromDayNumber(dayNumber: number): PlainDate {
  const d = new Date(dayNumber * MS_PER_DAY);
  return plainDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addDays(date: PlainDate, days: number): PlainDate {
  return fromDayNumber(toDayNumber(date) + days);
}

/** to − from，单位：天 */
export function diffDays(from: PlainDate, to: PlainDate): number {
  return toDayNumber(to) - toDayNumber(from);
}

export function compareDates(a: PlainDate, b: PlainDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function weekday(date: PlainDate): Weekday {
  // 1970-01-01 是周四
  return (((((toDayNumber(date) + 3) % 7) + 7) % 7) + 1) as Weekday;
}

export function isWeekend(date: PlainDate): boolean {
  return weekday(date) >= 6;
}

/** ISO 8601 周：周一开始，包含当年第一个周四的那一周是第 1 周 */
export function isoWeek(date: PlainDate): { year: number; week: number } {
  const thursday = toDayNumber(date) - weekday(date) + 4;
  const year = toYmd(fromDayNumber(thursday)).year;
  const jan1 = toDayNumber(plainDate(year, 1, 1));
  return { year, week: Math.floor((thursday - jan1) / 7) + 1 };
}

export function yearMonthOf(date: PlainDate): YearMonth {
  const { year, month } = toYmd(date);
  return { year, month };
}

export function addMonths(ym: YearMonth, months: number): YearMonth {
  const index = ym.year * 12 + (ym.month - 1) + months;
  return { year: Math.floor(index / 12), month: (((index % 12) + 12) % 12) + 1 };
}

/** 月视图的 42 天：从当月 1 日所在周的周一开始 */
export function monthGrid(ym: YearMonth): PlainDate[] {
  const first = plainDate(ym.year, ym.month, 1);
  const start = addDays(first, 1 - weekday(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** 设备本地时区的"今天" */
export function today(now: Date = new Date()): PlainDate {
  return plainDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
