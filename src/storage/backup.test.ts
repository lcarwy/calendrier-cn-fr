import { describe, expect, it } from 'vitest';
import type { PlainDate } from '../domain/date';
import type { CalendarEvent } from '../domain/events';
import { backupFileName, createBackup, mergeEvents, parseBackup, serializeBackup } from './backup';
import { DEFAULT_SETTINGS } from './settings';

function event(id: string, updatedAt: string, title = id): CalendarEvent {
  return {
    id,
    title,
    start: '2026-10-20' as PlainDate,
    color: 'teal',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
  };
}

describe('导出后再导入', () => {
  it('内容完全一致', () => {
    const settings = { ...DEFAULT_SETTINGS, frZone: 'alsace-moselle' as const };
    const events = [
      event('b', '2026-10-01T00:00:00.000Z'),
      { ...event('a', '2026-10-02T00:00:00.000Z'), recurrence: { freq: 'yearly' as const } },
    ];
    const text = serializeBackup(createBackup(settings, events, new Date('2026-10-14T10:00:00Z')));
    const parsed = parseBackup(text);
    expect(parsed).toMatchObject({ ok: true, settings, skipped: 0 });
    if (!parsed.ok) return;
    expect(parsed.exportedAt).toBe('2026-10-14T10:00:00.000Z');
    expect(parsed.events.map((e) => e.id).sort()).toEqual(['a', 'b']);
    expect(parsed.events.find((e) => e.id === 'a')?.recurrence).toEqual({ freq: 'yearly' });
  });

  it('文件名带日期', () => {
    expect(backupFileName('2026-10-14' as PlainDate)).toBe(
      'calendrier-franco-chinois-2026-10-14.json',
    );
  });
});

describe('parseBackup 的错误处理', () => {
  it('不是 JSON', () => {
    expect(parseBackup('pas du json')).toEqual({ ok: false, error: 'json' });
  });

  it('不是本应用的备份', () => {
    expect(parseBackup('{"app":"autre","events":[]}')).toEqual({ ok: false, error: 'format' });
    expect(parseBackup('[]')).toEqual({ ok: false, error: 'format' });
  });

  it('来自更新版本的应用', () => {
    expect(parseBackup('{"app":"calendrier-cn-fr","schemaVersion":99,"events":[]}')).toEqual({
      ok: false,
      error: 'version',
    });
  });

  it('跳过无法识别的事件，设置缺失时用默认值', () => {
    const parsed = parseBackup(
      JSON.stringify({
        app: 'calendrier-cn-fr',
        schemaVersion: 1,
        events: [event('ok', '2026-10-01T00:00:00.000Z'), { id: 'broken' }, 'x'],
      }),
    );
    expect(parsed).toMatchObject({ ok: true, skipped: 2, settings: DEFAULT_SETTINGS });
    if (parsed.ok) expect(parsed.events.map((e) => e.id)).toEqual(['ok']);
  });
});

describe('mergeEvents', () => {
  it('按 id 合并，较新的版本胜出', () => {
    const current = [
      event('same', '2026-10-05T00:00:00.000Z', 'nouveau'),
      event('mine', '2026-10-01T00:00:00.000Z'),
    ];
    const incoming = [
      event('same', '2026-10-01T00:00:00.000Z', 'ancien'),
      event('theirs', '2026-10-02T00:00:00.000Z'),
    ];
    const merged = mergeEvents(current, incoming);
    expect(merged.map((e) => e.id).sort()).toEqual(['mine', 'same', 'theirs']);
    expect(merged.find((e) => e.id === 'same')?.title).toBe('nouveau');

    const newer = mergeEvents(current, [event('same', '2026-10-09T00:00:00.000Z', 'plus récent')]);
    expect(newer.find((e) => e.id === 'same')?.title).toBe('plus récent');
  });
});
