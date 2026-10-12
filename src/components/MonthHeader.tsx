import { daysInMonth, plainDate } from '../domain/date';
import { lunarDateOf } from '../domain/lunar';
import { cnYearStatus, CN_FIRST_DATA_YEAR } from '../domain/cn-holidays';
import { t } from '../i18n';
import { MONTH_NAMES } from '../i18n/format';
import { goToMonth, goToToday, MAX_YEAR, MIN_YEAR, shiftMonth, viewMonth } from '../app/state';

const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i);

/** 本月覆盖的农历年，如 "乙巳年 (Serpent) → 丙午年 (Cheval)" */
function lunarYearsLabel(year: number, month: number): string {
  const first = lunarDateOf(plainDate(year, month, 1));
  const last = lunarDateOf(plainDate(year, month, daysInMonth(year, month)));
  const label = (l: typeof first) => `${l.yearGanzhi}年 (${l.zodiac.fr})`;
  return first.year === last.year ? label(first) : `${label(first)} → ${label(last)}`;
}

export function MonthHeader() {
  const { year, month } = viewMonth.value;
  const status = cnYearStatus(year);

  return (
    <div class="month-header">
      <div class="month-title">
        <select
          aria-label={t('nav.month')}
          value={month}
          onChange={(e) => goToMonth({ year, month: Number(e.currentTarget.value) })}
        >
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={i + 1}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label={t('nav.year')}
          value={year}
          onChange={(e) => goToMonth({ year: Number(e.currentTarget.value), month })}
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div class="month-nav">
        <button
          type="button"
          class="icon-button"
          aria-label={t('nav.previous')}
          disabled={year === MIN_YEAR && month === 1}
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <button type="button" class="today-button" onClick={goToToday}>
          {t('nav.today')}
        </button>
        <button
          type="button"
          class="icon-button"
          aria-label={t('nav.next')}
          disabled={year === MAX_YEAR && month === 12}
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>

      <p class="lunar-years">{lunarYearsLabel(year, month)}</p>

      {status === 'unpublished' && (
        <p class="notice" role="note">
          {t('notice.cnUnpublished', { year })}
        </p>
      )}
      {status === 'unavailable' && (
        <p class="notice" role="note">
          {t('notice.cnUnavailable', { year: CN_FIRST_DATA_YEAR })}
        </p>
      )}
    </div>
  );
}
