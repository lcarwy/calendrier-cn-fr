// 备份的导出（下载 JSON 文件）与导入（合并或替换）。
import { signal } from '@preact/signals';
import { today } from '../domain/date';
import {
  backupFileName,
  createBackup,
  getLastBackupDate,
  mergeEvents,
  serializeBackup,
  setLastBackupDate,
  type ParsedBackup,
} from '../storage/backup';
import { replaceAllEvents } from '../storage/events';
import { events, storageError } from './events';
import { appSettings } from './state';

export const lastBackupDate = signal(getLastBackupDate());

export function exportBackup(): void {
  const backup = createBackup(appSettings.value, events.value);
  const blob = new Blob([serializeBackup(backup)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = backupFileName(today());
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  const date = today();
  setLastBackupDate(date);
  lastBackupDate.value = date;
}

export async function applyImport(
  backup: Extract<ParsedBackup, { ok: true }>,
  mode: 'merge' | 'replace',
): Promise<number> {
  const next = mode === 'replace' ? backup.events : mergeEvents(events.value, backup.events);
  try {
    await replaceAllEvents(next);
  } catch {
    storageError.value = true;
  }
  events.value = next;
  if (mode === 'replace') appSettings.value = backup.settings;
  return next.length;
}
