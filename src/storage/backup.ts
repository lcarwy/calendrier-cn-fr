// 备份文件：导出 / 解析 / 合并。纯函数部分有单测，读写文件在 src/app/backup.ts。
import { isPlainDate, type PlainDate } from '../domain/date';
import { parseEvent, type CalendarEvent } from '../domain/events';
import { safeLocalStorage } from './local';
import { parseSettings, type AppSettings } from './settings';

export const BACKUP_APP_ID = 'calendrier-cn-fr';
export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupFile {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  settings: AppSettings;
  events: CalendarEvent[];
}

export type BackupError = 'json' | 'format' | 'version';

export type ParsedBackup =
  | {
      ok: true;
      exportedAt?: string;
      settings: AppSettings;
      events: CalendarEvent[];
      /** 无法识别而被跳过的事件数 */
      skipped: number;
    }
  | { ok: false; error: BackupError };

export function createBackup(
  settings: AppSettings,
  events: readonly CalendarEvent[],
  now: Date = new Date(),
): BackupFile {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    settings,
    events: [...events].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0)),
  };
}

export function serializeBackup(backup: BackupFile): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

/** calendrier-franco-chinois-2026-10-14.json（用设备本地日期） */
export function backupFileName(date: PlainDate): string {
  return `calendrier-franco-chinois-${date}.json`;
}

export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'json' };
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'format' };
  const r = raw as Record<string, unknown>;
  if (r.app !== BACKUP_APP_ID || !Array.isArray(r.events)) return { ok: false, error: 'format' };
  if (typeof r.schemaVersion !== 'number' || r.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return { ok: false, error: 'version' };
  }

  const byId = new Map<string, CalendarEvent>();
  let skipped = 0;
  for (const item of r.events) {
    const event = parseEvent(item);
    if (event) byId.set(event.id, event);
    else skipped++;
  }
  return {
    ok: true,
    ...(typeof r.exportedAt === 'string' && { exportedAt: r.exportedAt }),
    settings: parseSettings(r.settings),
    events: [...byId.values()],
    skipped,
  };
}

/** 按 id 合并，updatedAt 较新的版本胜出 */
export function mergeEvents(
  current: readonly CalendarEvent[],
  incoming: readonly CalendarEvent[],
): CalendarEvent[] {
  const byId = new Map(current.map((event) => [event.id, event]));
  for (const event of incoming) {
    const existing = byId.get(event.id);
    if (!existing || event.updatedAt > existing.updatedAt) byId.set(event.id, event);
  }
  return [...byId.values()];
}

const LAST_BACKUP_KEY = 'calendrier-cn-fr.lastBackup';

export function getLastBackupDate(storage = safeLocalStorage()): PlainDate | undefined {
  try {
    const value = storage?.getItem(LAST_BACKUP_KEY);
    return value && isPlainDate(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function setLastBackupDate(date: PlainDate, storage = safeLocalStorage()): void {
  try {
    storage?.setItem(LAST_BACKUP_KEY, date);
  } catch {
    // 记不住上次备份日期不影响使用
  }
}
