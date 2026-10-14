import { cnYearStatus } from '../domain/cn-holidays';
import { t } from '../i18n';
import { appSettings, layers, viewMonth } from '../app/state';

/** 只列出当前开启的图层 */
export function Legend() {
  const zone = t(`zone.${appSettings.value.frZone}`);
  const shown = layers.value;
  const showStatutory = shown.cnHolidays && cnYearStatus(viewMonth.value.year) === 'unpublished';

  return (
    <section class="legend" aria-labelledby="legend-title">
      <h2 id="legend-title" class="visually-hidden">
        {t('legend.title')}
      </h2>
      <ul>
        {shown.cnHolidays && (
          <li>
            <span class="badge badge-off" lang="zh-CN" aria-hidden="true">
              休
            </span>
            {t('legend.cnOff')}
          </li>
        )}
        {shown.cnHolidays && (
          <li>
            <span class="badge badge-work" lang="zh-CN" aria-hidden="true">
              班
            </span>
            {t('legend.cnWork')}
          </li>
        )}
        {showStatutory && (
          <li>
            <span class="statutory-dot" aria-hidden="true" />
            {t('legend.cnStatutory')}
          </li>
        )}
        {shown.frHolidays && (
          <li>
            <span class="badge badge-fr" aria-hidden="true">
              FR
            </span>
            {t('legend.frHoliday', { zone })}
          </li>
        )}
        {shown.festivals && (
          <li>
            <span class="day-label label-festival" lang="zh-CN" aria-hidden="true">
              中秋
            </span>
            {t('legend.festival')}
          </li>
        )}
        {shown.solarTerms && (
          <li>
            <span class="day-label label-term" lang="zh-CN" aria-hidden="true">
              寒露
            </span>
            {t('legend.term')}
          </li>
        )}
        {shown.lunar && (
          <li>
            <span class="day-label label-day" lang="zh-CN" aria-hidden="true">
              初四
            </span>
            {t('legend.lunar')}
          </li>
        )}
      </ul>
    </section>
  );
}
