import { toYmd } from '../domain/date';
import { CN_FIRST_DATA_YEAR } from '../domain/cn-holidays';
import { t } from '../i18n';
import { formatDayMonth, formatInstant, formatLongDate, ordinal } from '../i18n/format';
import { openEditEvent, openNewEvent, selectedOccurrences } from '../app/events';
import { layers, selectedInfo } from '../app/state';

const quote = (text: string) => `«\u00a0${text}\u00a0»`;

export function DayDetail() {
  const info = selectedInfo.value;
  const shown = layers.value;
  const occurrences = selectedOccurrences.value;
  const { lunar } = info;
  // 关闭的图层在详情里也不显示
  const cnHoliday = shown.cnHolidays ? info.cnHoliday : undefined;
  const frHolidays = shown.frHolidays ? info.frHolidays : [];
  const cnFestivals = shown.festivals ? info.cnFestivals : [];
  const solarTerm = shown.solarTerms ? info.solarTerm : undefined;
  const year = toYmd(info.date).year;
  const hasEvent = Boolean(cnHoliday || frHolidays.length || cnFestivals.length || solarTerm);

  return (
    <section class="day-detail" aria-live="polite">
      <h2 class="detail-date">{formatLongDate(info.date)}</h2>
      <p class="detail-week">{t('detail.week', { week: info.isoWeek.week })}</p>

      <div class="detail-block">
        <div class="block-head">
          <h3>{t('events.mine')}</h3>
          <button type="button" class="text-button" onClick={() => openNewEvent(info.date)}>
            + {t('events.addLong')}
          </button>
        </div>
        {occurrences.length > 0 && (
          <ul class="event-list">
            {occurrences.map(({ event, start, end }) => (
              <li key={event.id}>
                <button type="button" class="event-item" onClick={() => openEditEvent(event)}>
                  <span class={`event-dot ev-${event.color}`} aria-hidden="true" />
                  <span class="event-text">
                    <strong>{event.title}</strong>
                    <span class="muted small">
                      {[
                        event.time,
                        start !== end &&
                          t('events.range', {
                            from: formatDayMonth(start),
                            to: formatDayMonth(end),
                          }),
                        event.recurrence && t('events.everyYear'),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                    {event.notes && <span class="event-notes">{event.notes}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {shown.lunar && (
        <div class="detail-block">
          <h3>{t('detail.lunarTitle')}</h3>
          <p class="detail-lunar" lang="zh-CN">
            {lunar.monthName}
            {lunar.dayName}
          </p>
          <p>
            {t(lunar.isLeapMonth ? 'detail.lunarDateLeap' : 'detail.lunarDate', {
              day: ordinal(lunar.day),
              month: ordinal(lunar.month),
            })}
          </p>
          <p class="muted">
            {t('detail.lunarYear', { ganzhi: lunar.yearGanzhi, zodiac: lunar.zodiac.fr })}
          </p>
        </div>
      )}

      {cnHoliday && (
        <div class="detail-block">
          <h3>{t('detail.chinaTitle')}</h3>
          <p class="detail-row">
            {cnHoliday.kind === 'off' && (
              <span class="badge badge-off" lang="zh-CN">
                休
              </span>
            )}
            {cnHoliday.kind === 'work' && (
              <span class="badge badge-work" lang="zh-CN">
                班
              </span>
            )}
            {cnHoliday.kind === 'statutory-unpublished' && <span class="statutory-dot" />}
            <strong>
              {cnHoliday.kind === 'off' && t('detail.cnOff')}
              {cnHoliday.kind === 'work' && t('detail.cnWork')}
              {cnHoliday.kind === 'statutory-unpublished' && t('detail.cnStatutory')}
            </strong>
          </p>
          <ul class="name-list">
            {cnHoliday.names.map((name) => (
              <li key={name.zh}>
                {name.fr} <span lang="zh-CN">{name.zh}</span>
              </li>
            ))}
          </ul>
          {cnHoliday.kind === 'work' && <p class="muted">{t('detail.cnWorkHint')}</p>}
          {cnHoliday.kind === 'statutory-unpublished' && (
            <p class="muted">{t('detail.cnStatutoryHint', { year })}</p>
          )}
          {cnHoliday.kind !== 'statutory-unpublished' && cnHoliday.papers[0] && (
            <p>
              <a href={cnHoliday.papers.at(-1)} target="_blank" rel="noopener noreferrer">
                {t('detail.cnSource')}
              </a>
            </p>
          )}
        </div>
      )}

      {frHolidays.length > 0 && (
        <div class="detail-block">
          <h3>{t('detail.franceTitle')}</h3>
          {frHolidays.map((holiday) => (
            <div key={holiday.id}>
              <p class="detail-row">
                <span class="badge badge-fr">FR</span>
                <strong>{holiday.name.fr}</strong>
                <span class="muted">· {t('detail.frHoliday')}</span>
              </p>
              {holiday.mandatoryOff && <p class="muted">{t('detail.frMandatory')}</p>}
              {holiday.solidarityDay && <p class="muted">{t('detail.frSolidarity')}</p>}
            </div>
          ))}
        </div>
      )}

      {cnFestivals.length > 0 && (
        <div class="detail-block">
          <h3>{t('detail.festivalTitle')}</h3>
          <ul class="name-list">
            {cnFestivals.map((festival) => (
              <li key={festival.id}>
                <span class="festival-zh" lang="zh-CN">
                  {festival.zh}
                </span>{' '}
                <em>{festival.pinyin}</em> — {festival.name.fr}
              </li>
            ))}
          </ul>
        </div>
      )}

      {solarTerm && (
        <div class="detail-block">
          <h3>{t('detail.termTitle')}</h3>
          <p>
            <span class="term-zh" lang="zh-CN">
              {solarTerm.zh}
            </span>{' '}
            <em>{solarTerm.pinyin}</em> — {quote(solarTerm.name.fr)}
          </p>
          <p class="muted">{t('detail.termOrder', { order: ordinal(solarTerm.order) })}</p>
          <p class="muted">
            {t('detail.termTime', {
              beijing: formatInstant(solarTerm.instant, 'Asia/Shanghai'),
              paris: formatInstant(solarTerm.instant, 'Europe/Paris'),
            })}
          </p>
        </div>
      )}

      {!hasEvent && <p class="muted">{t('detail.nothing')}</p>}
      {shown.cnHolidays && info.cnYearStatus === 'unavailable' && (
        <p class="muted">{t('detail.cnUnavailable', { year: CN_FIRST_DATA_YEAR })}</p>
      )}
    </section>
  );
}
