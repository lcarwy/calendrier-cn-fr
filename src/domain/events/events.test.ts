import { describe, expect, it } from 'vitest';
import type { PlainDate } from '../date';
import { occurrencesInRange, parseEvent, validateEvent, type CalendarEvent } from './index';

const d = (s: string) => s as PlainDate;
const TS = '2026-10-14T08:00:00.000Z';

type EventInput = Omit<Partial<CalendarEvent>, 'start' | 'end'> & { start: string; end?: string };

function event(partial: EventInput): CalendarEvent {
  const { start, end, ...rest } = partial;
  return {
    id: partial.id ?? partial.title ?? 'e1',
    title: 'Événement',
    color: 'teal',
    createdAt: TS,
    updatedAt: TS,
    ...rest,
    start: d(start),
    ...(end && { end: d(end) }),
  };
}

const datesOf = (map: Map<PlainDate, unknown[]>) => [...map.keys()].sort();

describe('occurrencesInRange', () => {
  it('单日事件只出现在当天', () => {
    const map = occurrencesInRange(
      [event({ start: '2026-10-20' })],
      d('2026-10-01'),
      d('2026-10-31'),
    );
    expect(datesOf(map)).toEqual(['2026-10-20']);
    expect(map.get(d('2026-10-20'))?.[0]).toMatchObject({ isStart: true, isEnd: true });
  });

  it('多日事件每天都出现，并标出首尾', () => {
    const map = occurrencesInRange(
      [event({ start: '2026-10-30', end: '2026-11-02' })],
      d('2026-10-26'),
      d('2026-11-01'),
    );
    expect(datesOf(map)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
    expect(map.get(d('2026-10-30'))?.[0]?.isStart).toBe(true);
    expect(map.get(d('2026-11-01'))?.[0]?.isEnd).toBe(false);
  });

  it('每年重复：之后每年出现，原始年份之前不出现', () => {
    const birthday = event({ start: '2024-03-15', recurrence: { freq: 'yearly' } });
    expect(datesOf(occurrencesInRange([birthday], d('2026-03-01'), d('2026-03-31')))).toEqual([
      '2026-03-15',
    ]);
    expect(occurrencesInRange([birthday], d('2023-01-01'), d('2023-12-31')).size).toBe(0);
  });

  it('2 月 29 日每年重复：平年在 2 月 28 日', () => {
    const leap = event({ start: '2024-02-29', recurrence: { freq: 'yearly' } });
    expect(datesOf(occurrencesInRange([leap], d('2027-02-01'), d('2027-03-31')))).toEqual([
      '2027-02-28',
    ]);
    expect(datesOf(occurrencesInRange([leap], d('2028-02-01'), d('2028-03-31')))).toEqual([
      '2028-02-29',
    ]);
  });

  it('跨年的每年重复多日事件在下一年 1 月也能看到', () => {
    const newYearTrip = event({
      start: '2025-12-30',
      end: '2026-01-02',
      recurrence: { freq: 'yearly' },
    });
    expect(datesOf(occurrencesInRange([newYearTrip], d('2027-01-01'), d('2027-01-31')))).toEqual([
      '2027-01-01',
      '2027-01-02',
    ]);
  });

  it('同一天的排序：多日 > 全天 > 按时间', () => {
    const list = occurrencesInRange(
      [
        event({ id: 'late', title: 'Dîner', start: '2026-10-20', time: '19:30' }),
        event({ id: 'early', title: 'Café', start: '2026-10-20', time: '08:00' }),
        event({ id: 'allday', title: 'Télétravail', start: '2026-10-20' }),
        event({ id: 'trip', title: 'Voyage', start: '2026-10-19', end: '2026-10-21' }),
      ],
      d('2026-10-20'),
      d('2026-10-20'),
    ).get(d('2026-10-20'));
    expect(list?.map((o) => o.event.id)).toEqual(['trip', 'allday', 'early', 'late']);
  });
});

describe('validateEvent', () => {
  it('合法事件没有错误', () => {
    expect(validateEvent({ title: 'Réunion', start: '2026-10-20', time: '09:30' })).toEqual([]);
  });

  it('各类错误', () => {
    expect(validateEvent({ title: '  ', start: '2026-10-20' })).toEqual(['title']);
    expect(validateEvent({ title: 'x', start: '2026-02-30' })).toEqual(['start']);
    expect(validateEvent({ title: 'x', start: '2026-10-20', end: '2026-10-19' })).toEqual(['end']);
    expect(validateEvent({ title: 'x', start: '2026-01-01', end: '2027-01-02' })).toEqual([
      'tooLong',
    ]);
    expect(validateEvent({ title: 'x', start: '2026-10-20', time: '25:00' })).toEqual(['time']);
  });
});

describe('parseEvent（导入用）', () => {
  it('补默认值、去掉与开始相同的结束日期', () => {
    const parsed = parseEvent({
      id: 'a',
      title: ' Fête ',
      start: '2026-10-20',
      end: '2026-10-20',
      color: 'rainbow',
      recurrence: { freq: 'yearly' },
    });
    expect(parsed).toMatchObject({
      id: 'a',
      title: 'Fête',
      start: '2026-10-20',
      color: 'teal',
      recurrence: { freq: 'yearly' },
    });
    expect(parsed?.end).toBeUndefined();
  });

  it('结构不对返回 undefined', () => {
    expect(parseEvent(null)).toBeUndefined();
    expect(parseEvent({ id: 'a', title: 'x' })).toBeUndefined();
    expect(parseEvent({ id: 'a', title: 'x', start: 'demain' })).toBeUndefined();
  });
});
