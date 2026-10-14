// 法语日期格式。用 UTC 构造 Date 并以 timeZone: 'UTC' 格式化，日期不会因时区偏移。
import { toYmd, type PlainDate, type YearMonth } from '../domain/date';

const LOCALE = 'fr-FR';

const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));
const formatter = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: 'UTC', ...options });

const longDate = formatter({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const monthYear = formatter({ month: 'long', year: 'numeric' });
const monthOnly = formatter({ month: 'long' });
const weekdayShort = formatter({ weekday: 'short' });

/** mardi 13 octobre 2026 */
export function formatLongDate(date: PlainDate): string {
  const { year, month, day } = toYmd(date);
  return longDate.format(utc(year, month, day));
}

/** octobre 2026 */
export function formatMonthYear(ym: YearMonth): string {
  return monthYear.format(utc(ym.year, ym.month, 1));
}

/** janvier … décembre */
export const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  monthOnly.format(utc(2000, i + 1, 1)),
);

/** lun. … dim.（2024-01-01 是周一） */
export const WEEKDAY_SHORT_NAMES = Array.from({ length: 7 }, (_, i) =>
  weekdayShort.format(utc(2024, 1, 1 + i)),
);

/** 某一时刻在指定时区的日期和时间：5 avril à 02:40 */
export function formatInstant(epochMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(epochMs);
}

/** 1er, 2ᵉ, 3ᵉ … */
export function ordinal(n: number): string {
  return n === 1 ? '1er' : `${n}ᵉ`;
}

const dayMonth = formatter({ day: 'numeric', month: 'long' });

/** 30 octobre */
export function formatDayMonth(date: PlainDate): string {
  const { year, month, day } = toYmd(date);
  return dayMonth.format(utc(year, month, day));
}
