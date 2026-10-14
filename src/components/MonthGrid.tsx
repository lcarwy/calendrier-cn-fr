import { useRef } from 'preact/hooks';
import { addDays, toYmd, type PlainDate } from '../domain/date';
import { cellLabel, type DayInfo, type Layers } from '../domain/day-info';
import type { EventOccurrence } from '../domain/events';
import { monthOccurrences } from '../app/events';
import { t } from '../i18n';
import { formatLongDate, formatMonthYear, WEEKDAY_SHORT_NAMES } from '../i18n/format';
import {
  appSettings,
  layers,
  monthDays,
  selectDate,
  selectedDate,
  shiftMonth,
  shiftSelectionByMonths,
  todayDate,
  viewMonth,
} from '../app/state';

const ARROW_DELTAS: Readonly<Record<string, number>> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

function focusDate(date: PlainDate) {
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>(`[data-date="${date}"]`)?.focus();
  });
}

/** 读屏用的完整描述 */
function dayAriaLabel(info: DayInfo, shown: Layers, occurrences: EventOccurrence[]): string {
  const parts = [formatLongDate(info.date)];
  parts.push(...occurrences.map((o) => o.event.title));
  if (shown.lunar) parts.push(`${info.lunar.monthName}${info.lunar.dayName}`);
  if (shown.festivals) parts.push(...info.cnFestivals.map((f) => f.name.fr));
  if (shown.solarTerms && info.solarTerm) parts.push(info.solarTerm.name.fr);
  const cn = shown.cnHolidays ? info.cnHoliday : undefined;
  if (cn) {
    const names = cn.names.map((n) => n.fr).join(', ');
    const kind = {
      off: t('aria.cnOff'),
      work: t('aria.cnWork'),
      'statutory-unpublished': t('aria.cnStatutory'),
    }[cn.kind];
    parts.push(`${kind}\u00a0: ${names}`);
  }
  if (shown.frHolidays && info.frHolidays.length) {
    parts.push(`${t('aria.frHoliday')}\u00a0: ${info.frHolidays.map((h) => h.name.fr).join(', ')}`);
  }
  return parts.join(', ');
}

interface DayCellProps {
  info: DayInfo;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  shown: Layers;
  occurrences: EventOccurrence[];
}

/** 格子里最多显示的事件条数，其余显示 +N */
const MAX_CHIPS = 2;

function DayCell({ info, inMonth, isToday, isSelected, shown, occurrences }: DayCellProps) {
  const label = cellLabel(info, shown);
  const cn = shown.cnHolidays ? info.cnHoliday : undefined;
  const fr = shown.frHolidays ? info.frHolidays : [];
  const classes = [
    'day',
    !inMonth && 'is-outside',
    isToday && 'is-today',
    isSelected && 'is-selected',
    info.isWeekend && 'is-weekend',
    cn && `cn-${cn.kind}`,
    fr.length > 0 && 'is-fr-holiday',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="gridcell" aria-selected={isSelected} class="day-cell">
      <button
        type="button"
        class={classes}
        data-date={info.date}
        tabIndex={isSelected ? 0 : -1}
        aria-label={dayAriaLabel(info, shown, occurrences)}
        aria-current={isToday ? 'date' : undefined}
        onClick={() => selectDate(info.date)}
      >
        <span class="day-top" aria-hidden="true">
          <span class="day-num">{toYmd(info.date).day}</span>
          {cn?.kind === 'off' && (
            <span class="badge badge-off" lang="zh-CN">
              休
            </span>
          )}
          {cn?.kind === 'work' && (
            <span class="badge badge-work" lang="zh-CN">
              班
            </span>
          )}
          {cn?.kind === 'statutory-unpublished' && <span class="statutory-dot" />}
        </span>
        {label && (
          <span class={`day-label label-${label.kind}`} lang="zh-CN" aria-hidden="true">
            {label.text}
          </span>
        )}
        {occurrences.length > 0 && (
          <span class="event-chips" aria-hidden="true">
            {occurrences.slice(0, MAX_CHIPS).map((o) => (
              <span class={`event-chip ev-${o.event.color}`} key={o.event.id}>
                {o.event.time && o.isStart && <span class="event-time">{o.event.time}</span>}
                {o.event.title}
              </span>
            ))}
            {occurrences.length > MAX_CHIPS && (
              <span class="event-more">
                {t('events.more', { count: occurrences.length - MAX_CHIPS })}
              </span>
            )}
          </span>
        )}
        {fr[0] && (
          <span class="fr-tag" aria-hidden="true">
            <span class="fr-short">FR</span>
            <span class="fr-name">{fr[0].name.fr}</span>
          </span>
        )}
      </button>
    </div>
  );
}

export function MonthGrid() {
  const days = monthDays.value;
  const { month } = viewMonth.value;
  const selected = selectedDate.value;
  const todayValue = todayDate.value;
  const shown = layers.value;
  const occurrencesByDate = monthOccurrences.value;
  const showWeeks = appSettings.value.showWeekNumbers;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onKeyDown = (e: KeyboardEvent) => {
    const delta = ARROW_DELTAS[e.key];
    if (delta !== undefined) {
      e.preventDefault();
      const next = addDays(selected, delta);
      selectDate(next);
      focusDate(selectedDate.value);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      shiftSelectionByMonths(e.key === 'PageUp' ? -1 : 1);
      focusDate(selectedDate.value);
    }
  };

  // 手机上左右滑动翻月
  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    const touch = e.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) shiftMonth(dx < 0 ? 1 : -1);
  };

  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return (
    <div
      class={showWeeks ? 'month-grid with-weeks' : 'month-grid'}
      role="grid"
      aria-label={t('nav.calendar', { month: formatMonthYear(viewMonth.value) })}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div role="row" class="week-row weekday-row">
        {showWeeks && (
          <div role="columnheader" class="week-num">
            {t('grid.week')}
          </div>
        )}
        {WEEKDAY_SHORT_NAMES.map((name) => (
          <div role="columnheader" class="weekday" key={name}>
            {name}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div role="row" class="week-row" key={week[0]?.date}>
          {showWeeks && week[0] && (
            <div
              role="rowheader"
              class="week-num"
              aria-label={t('grid.weekNumber', { week: week[0].isoWeek.week })}
            >
              {week[0].isoWeek.week}
            </div>
          )}
          {week.map((info) => (
            <DayCell
              key={info.date}
              info={info}
              inMonth={toYmd(info.date).month === month}
              isToday={info.date === todayValue}
              isSelected={info.date === selected}
              shown={shown}
              occurrences={occurrencesByDate.get(info.date) ?? []}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
