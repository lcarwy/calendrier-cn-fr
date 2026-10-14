// 自定义事件：数据模型、校验、按日期展开（多日、每年重复）。纯函数。
import {
  addDays,
  compareDates,
  diffDays,
  isLeapYear,
  isPlainDate,
  plainDate,
  toYmd,
  type PlainDate,
} from '../date';

export type ColorKey = 'teal' | 'orange' | 'purple' | 'pink' | 'gold' | 'gray';
export const COLOR_KEYS: readonly ColorKey[] = ['teal', 'orange', 'purple', 'pink', 'gold', 'gray'];
export const DEFAULT_COLOR: ColorKey = 'teal';

export interface CalendarEvent {
  id: string;
  title: string;
  start: PlainDate;
  /** 含当天；单日事件不填 */
  end?: PlainDate;
  /** 'HH:mm'，浮动时间（不带时区） */
  time?: string;
  color: ColorKey;
  notes?: string;
  recurrence?: { freq: 'yearly' };
  /** ISO 时间戳 */
  createdAt: string;
  updatedAt: string;
}

export interface EventOccurrence {
  event: CalendarEvent;
  date: PlainDate;
  /** 这一次出现的起止日期（每年重复时是当年的日期） */
  start: PlainDate;
  end: PlainDate;
  isStart: boolean;
  isEnd: boolean;
}

/** 单个事件最长天数（防止误填导致整年铺满） */
export const MAX_EVENT_DAYS = 366;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export type EventError = 'title' | 'start' | 'end' | 'tooLong' | 'time';

export function validateEvent(event: {
  title: string;
  start: string;
  end?: string;
  time?: string;
}): EventError[] {
  const errors: EventError[] = [];
  if (!event.title.trim()) errors.push('title');
  if (!isPlainDate(event.start)) errors.push('start');
  if (event.end !== undefined) {
    if (!isPlainDate(event.end) || (isPlainDate(event.start) && event.end < event.start)) {
      errors.push('end');
    } else if (isPlainDate(event.start) && diffDays(event.start, event.end) >= MAX_EVENT_DAYS) {
      errors.push('tooLong');
    }
  }
  if (event.time !== undefined && !TIME_PATTERN.test(event.time)) errors.push('time');
  return errors;
}

/** 把起始日期移到另一年；2 月 29 日在平年落到 2 月 28 日 */
function sameDayInYear(date: PlainDate, year: number): PlainDate {
  const { month, day } = toYmd(date);
  return plainDate(year, month, month === 2 && day === 29 && !isLeapYear(year) ? 28 : day);
}

/** 事件在 [from, to] 范围内的每一次出现的起止日期 */
function spans(event: CalendarEvent, from: PlainDate, to: PlainDate): [PlainDate, PlainDate][] {
  const length = event.end ? diffDays(event.start, event.end) : 0;
  if (!event.recurrence) return [[event.start, addDays(event.start, length)]];

  const result: [PlainDate, PlainDate][] = [];
  const firstYear = Math.max(toYmd(event.start).year, toYmd(from).year - 1);
  for (let year = firstYear; year <= toYmd(to).year; year++) {
    const start = sameDayInYear(event.start, year);
    result.push([start, addDays(start, length)]);
  }
  return result;
}

function compareOccurrences(a: EventOccurrence, b: EventOccurrence): number {
  // 多日事件在前，然后全天事件，再按时间、标题
  const aMulti = a.start !== a.end ? 0 : 1;
  const bMulti = b.start !== b.end ? 0 : 1;
  if (aMulti !== bMulti) return aMulti - bMulti;
  const aTime = a.event.time ?? '';
  const bTime = b.event.time ?? '';
  if (aTime !== bTime) return aTime < bTime ? -1 : 1;
  return a.event.title.localeCompare(b.event.title, 'fr');
}

/** 按日期列出 [from, to]（含两端）内的所有事件出现 */
export function occurrencesInRange(
  events: readonly CalendarEvent[],
  from: PlainDate,
  to: PlainDate,
): Map<PlainDate, EventOccurrence[]> {
  const byDate = new Map<PlainDate, EventOccurrence[]>();
  for (const event of events) {
    for (const [start, end] of spans(event, from, to)) {
      if (end < from || start > to) continue;
      const first = compareDates(start, from) < 0 ? from : start;
      const last = compareDates(end, to) > 0 ? to : end;
      for (let date = first; date <= last; date = addDays(date, 1)) {
        const list = byDate.get(date) ?? [];
        list.push({ event, date, start, end, isStart: date === start, isEnd: date === end });
        byDate.set(date, list);
      }
    }
  }
  for (const list of byDate.values()) list.sort(compareOccurrences);
  return byDate;
}

/** 宽容解析（用于导入备份）：结构不对返回 undefined */
export function parseEvent(raw: unknown): CalendarEvent | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const str = (value: unknown) => (typeof value === 'string' ? value : undefined);
  const id = str(r.id);
  const title = str(r.title);
  const start = str(r.start);
  const end = str(r.end);
  const time = str(r.time);
  if (!id || title === undefined || start === undefined) return undefined;
  if (validateEvent({ title, start, end, time }).length) return undefined;
  const color = COLOR_KEYS.find((c) => c === r.color) ?? DEFAULT_COLOR;
  const yearly =
    typeof r.recurrence === 'object' &&
    r.recurrence !== null &&
    (r.recurrence as Record<string, unknown>).freq === 'yearly';
  const now = new Date().toISOString();
  return {
    id,
    title: title.trim(),
    start: start as PlainDate,
    ...(end && end !== start && { end: end as PlainDate }),
    ...(time && { time }),
    color,
    ...(str(r.notes) && { notes: str(r.notes) }),
    ...(yearly && { recurrence: { freq: 'yearly' as const } }),
    createdAt: str(r.createdAt) ?? now,
    updatedAt: str(r.updatedAt) ?? now,
  };
}
