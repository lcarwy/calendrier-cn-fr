import { useEffect, useRef, useState } from 'preact/hooks';
import { type PlainDate } from '../domain/date';
import { COLOR_KEYS, validateEvent, type EventError } from '../domain/events';
import { t, type MessageKey } from '../i18n';
import { closeEditor, editingDraft, removeEvent, saveEvent, type EventDraft } from '../app/events';
import { MAX_YEAR, MIN_YEAR, selectDate } from '../app/state';

const MIN_DATE = `${MIN_YEAR}-01-01`;
const MAX_DATE = `${MAX_YEAR}-12-31`;

const ERROR_MESSAGES: Record<EventError, MessageKey> = {
  title: 'events.error.title',
  start: 'events.error.date',
  end: 'events.error.end',
  tooLong: 'events.error.tooLong',
  time: 'events.error.time',
};

/** 新建 / 编辑事件的弹出面板，由 editingDraft 控制开关 */
export function EventEditor() {
  const draft = editingDraft.value;
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (draft && !dialog.open) dialog.showModal();
    if (!draft && dialog.open) dialog.close();
  }, [draft]);

  return (
    <dialog
      ref={ref}
      class="sheet"
      aria-labelledby="event-editor-title"
      onClose={closeEditor}
      // 点击遮罩关闭
      onClick={(e) => e.target === e.currentTarget && closeEditor()}
    >
      {draft && <EventForm key={draft.id ?? `new-${draft.start}`} draft={draft} />}
    </dialog>
  );
}

function EventForm({ draft }: { draft: EventDraft }) {
  const [title, setTitle] = useState(draft.title);
  const [start, setStart] = useState<string>(draft.start);
  const [multiDay, setMultiDay] = useState(Boolean(draft.end));
  const [end, setEnd] = useState<string>(draft.end ?? draft.start);
  const [time, setTime] = useState(draft.time ?? '');
  const [color, setColor] = useState(draft.color);
  const [yearly, setYearly] = useState(draft.yearly);
  const [notes, setNotes] = useState(draft.notes);
  const [errors, setErrors] = useState<EventError[]>([]);
  const isNew = !draft.id;

  const errorText = (...keys: EventError[]) =>
    keys
      .filter((key) => errors.includes(key))
      .map((key) => (
        <p class="field-error" key={key}>
          {t(ERROR_MESSAGES[key])}
        </p>
      ));

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const found = validateEvent({
      title,
      start,
      ...(multiDay && { end }),
      ...(time && { time }),
    });
    setErrors(found);
    if (found.length) return;

    const now = new Date().toISOString();
    const startDate = start as PlainDate;
    const endDate = multiDay && end !== start ? (end as PlainDate) : undefined;
    void saveEvent({
      id: draft.id ?? crypto.randomUUID(),
      title: title.trim(),
      start: startDate,
      ...(endDate && { end: endDate }),
      ...(time && { time }),
      color,
      ...(notes.trim() && { notes: notes.trim() }),
      ...(yearly && { recurrence: { freq: 'yearly' as const } }),
      createdAt: draft.createdAt ?? now,
      updatedAt: now,
    });
    selectDate(startDate);
    closeEditor();
  };

  const onDelete = () => {
    if (draft.id && confirm(t('events.confirmDelete', { title: draft.title }))) {
      void removeEvent(draft.id);
      closeEditor();
    }
  };

  return (
    <form class="sheet-body event-form" onSubmit={onSubmit} noValidate>
      <header class="sheet-header">
        <h2 id="event-editor-title">{t(isNew ? 'events.new' : 'events.edit')}</h2>
        <button type="button" class="text-button" onClick={closeEditor}>
          {t('common.cancel')}
        </button>
      </header>

      <label class="field">
        <span>{t('events.title')}</span>
        <input
          type="text"
          value={title}
          maxLength={200}
          placeholder={t('events.titlePlaceholder')}
          autoFocus={isNew}
          aria-invalid={errors.includes('title')}
          onInput={(e) => setTitle(e.currentTarget.value)}
        />
      </label>
      {errorText('title')}

      <div class="field-row">
        <label class="field">
          <span>{t(multiDay ? 'events.from' : 'events.date')}</span>
          <input
            type="date"
            value={start}
            min={MIN_DATE}
            max={MAX_DATE}
            aria-invalid={errors.includes('start')}
            onInput={(e) => {
              const value = e.currentTarget.value;
              setStart(value);
              if (end < value) setEnd(value);
            }}
          />
        </label>
        {multiDay && (
          <label class="field">
            <span>{t('events.to')}</span>
            <input
              type="date"
              value={end}
              min={start}
              max={MAX_DATE}
              aria-invalid={errors.includes('end') || errors.includes('tooLong')}
              onInput={(e) => setEnd(e.currentTarget.value)}
            />
          </label>
        )}
      </div>
      {errorText('start', 'end', 'tooLong')}

      <label class="option">
        <input
          type="checkbox"
          checked={multiDay}
          onChange={(e) => setMultiDay(e.currentTarget.checked)}
        />
        <span>{t('events.multiDay')}</span>
      </label>

      <label class="field field-narrow">
        <span>{t('events.time')}</span>
        <input
          type="time"
          value={time}
          aria-invalid={errors.includes('time')}
          onInput={(e) => setTime(e.currentTarget.value)}
        />
      </label>
      {errorText('time')}

      <fieldset class="field">
        <legend>{t('events.color')}</legend>
        <div class="swatches">
          {COLOR_KEYS.map((key) => (
            <label class="swatch" key={key} title={t(`color.${key}`)}>
              <input
                type="radio"
                name="event-color"
                checked={color === key}
                aria-label={t(`color.${key}`)}
                onChange={() => setColor(key)}
              />
              <span class={`swatch-dot ev-${key}`} />
            </label>
          ))}
        </div>
      </fieldset>

      <label class="option">
        <input
          type="checkbox"
          checked={yearly}
          onChange={(e) => setYearly(e.currentTarget.checked)}
        />
        <span>{t('events.yearly')}</span>
      </label>

      <label class="field">
        <span>{t('events.notes')}</span>
        <textarea rows={3} value={notes} onInput={(e) => setNotes(e.currentTarget.value)} />
      </label>

      <div class="form-actions">
        {!isNew && (
          <button type="button" class="danger-button" onClick={onDelete}>
            {t('events.delete')}
          </button>
        )}
        <button type="submit" class="primary-button">
          {t('events.save')}
        </button>
      </div>
    </form>
  );
}
