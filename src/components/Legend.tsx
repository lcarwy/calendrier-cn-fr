import { cnYearStatus } from '../domain/cn-holidays';
import { t } from '../i18n';
import { settings, viewMonth } from '../app/state';

export function Legend() {
  const zone = t(`zone.${settings.value.frZone}`);
  const showStatutory = cnYearStatus(viewMonth.value.year) === 'unpublished';

  return (
    <section class="legend" aria-labelledby="legend-title">
      <h2 id="legend-title" class="visually-hidden">
        {t('legend.title')}
      </h2>
      <ul>
        <li>
          <span class="badge badge-off" lang="zh-CN" aria-hidden="true">
            休
          </span>
          {t('legend.cnOff')}
        </li>
        <li>
          <span class="badge badge-work" lang="zh-CN" aria-hidden="true">
            班
          </span>
          {t('legend.cnWork')}
        </li>
        {showStatutory && (
          <li>
            <span class="statutory-dot" aria-hidden="true" />
            {t('legend.cnStatutory')}
          </li>
        )}
        <li>
          <span class="badge badge-fr" aria-hidden="true">
            FR
          </span>
          {t('legend.frHoliday', { zone })}
        </li>
        <li>
          <span class="day-label label-festival" lang="zh-CN" aria-hidden="true">
            中秋
          </span>
          {t('legend.festival')}
        </li>
        <li>
          <span class="day-label label-term" lang="zh-CN" aria-hidden="true">
            寒露
          </span>
          {t('legend.term')}
        </li>
        <li>
          <span class="day-label label-day" lang="zh-CN" aria-hidden="true">
            初四
          </span>
          {t('legend.lunar')}
        </li>
      </ul>
    </section>
  );
}
