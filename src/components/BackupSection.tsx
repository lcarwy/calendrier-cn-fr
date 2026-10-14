import { useRef, useState } from 'preact/hooks';
import { diffDays, today, type PlainDate } from '../domain/date';
import { parseBackup, type ParsedBackup } from '../storage/backup';
import { t, tCount } from '../i18n';
import { formatLongDate } from '../i18n/format';
import { applyImport, exportBackup, lastBackupDate } from '../app/backup';
import { events } from '../app/events';

type ValidBackup = Extract<ParsedBackup, { ok: true }>;

/** 超过这么多天没导出就提醒 */
const REMINDER_DAYS = 30;

function localDateOf(timestamp: string | undefined): PlainDate | undefined {
  if (!timestamp) return undefined;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? undefined : today(date);
}

/** 设置面板里的"导出 / 导入备份" */
export function BackupSection() {
  const [pending, setPending] = useState<ValidBackup | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const last = lastBackupDate.value;
  const needsReminder =
    events.value.length > 0 && (!last || diffDays(last, today()) > REMINDER_DAYS);

  const onFile = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // 允许再次选择同一个文件
    if (!file) return;
    setStatus(null);
    setPending(null);
    let text: string;
    try {
      text = await file.text();
    } catch {
      setStatus({ ok: false, text: t('backup.error.read') });
      return;
    }
    const parsed = parseBackup(text);
    if (parsed.ok) setPending(parsed);
    else setStatus({ ok: false, text: t(`backup.error.${parsed.error}`) });
  };

  const apply = async (mode: 'merge' | 'replace') => {
    if (!pending) return;
    if (mode === 'replace' && !confirm(t('backup.replaceConfirm'))) return;
    const count = await applyImport(pending, mode);
    setPending(null);
    setStatus({ ok: true, text: t('backup.done', { events: tCount('backup.events', count) }) });
  };

  const exportedOn = localDateOf(pending?.exportedAt);

  return (
    <fieldset>
      <legend>{t('backup.title')}</legend>
      <p class="muted small">{t('backup.explain')}</p>
      <p class="small">
        {last ? t('backup.lastExport', { date: formatLongDate(last) }) : t('backup.never')}{' '}
        {needsReminder && <strong>{t('backup.reminder')}</strong>}
      </p>
      <div class="button-row">
        <button type="button" class="secondary-button" onClick={exportBackup}>
          {t('backup.export')}
        </button>
        <button type="button" class="secondary-button" onClick={() => fileRef.current?.click()}>
          {t('backup.import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => void onFile(e)}
        />
      </div>

      {pending && (
        <div class="import-box">
          <p>
            {exportedOn
              ? t('backup.found', {
                  date: formatLongDate(exportedOn),
                  events: tCount('backup.events', pending.events.length),
                })
              : t('backup.foundUndated', {
                  events: tCount('backup.events', pending.events.length),
                })}
          </p>
          {pending.skipped > 0 && (
            <p class="muted small">{tCount('backup.skipped', pending.skipped)}</p>
          )}
          <p class="muted small">{t('backup.mergeHint')}</p>
          <div class="button-row">
            <button type="button" class="primary-button" onClick={() => void apply('merge')}>
              {t('backup.merge')}
            </button>
            <button type="button" class="danger-button" onClick={() => void apply('replace')}>
              {t('backup.replace')}
            </button>
            <button type="button" class="text-button" onClick={() => setPending(null)}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {status && (
        <p class={status.ok ? 'success-text' : 'field-error'} role="status">
          {status.text}
        </p>
      )}
    </fieldset>
  );
}
