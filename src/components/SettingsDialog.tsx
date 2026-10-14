import type { RefObject } from 'preact';
import type { Layers } from '../domain/day-info';
import { FR_ZONES } from '../domain/fr-holidays';
import { THEMES } from '../storage/settings';
import { t } from '../i18n';
import { appSettings, setLayer, updateSettings } from '../app/state';
import { BackupSection } from './BackupSection';

const LAYER_KEYS: readonly (keyof Layers)[] = [
  'cnHolidays',
  'frHolidays',
  'lunar',
  'solarTerms',
  'festivals',
];

interface Props {
  dialogRef: RefObject<HTMLDialogElement | null>;
}

export function SettingsDialog({ dialogRef }: Props) {
  const settings = appSettings.value;
  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      class="sheet"
      aria-labelledby="settings-title"
      // 点击遮罩关闭
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div class="sheet-body">
        <header class="sheet-header">
          <h2 id="settings-title">{t('settings.title')}</h2>
          <button type="button" class="text-button" onClick={close}>
            {t('common.close')}
          </button>
        </header>

        <fieldset>
          <legend>{t('settings.zone')}</legend>
          {FR_ZONES.map((zone) => (
            <label class="option" key={zone}>
              <input
                type="radio"
                name="fr-zone"
                checked={settings.frZone === zone}
                onChange={() => updateSettings({ frZone: zone })}
              />
              <span>{t(`settings.zone.${zone}`)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>{t('settings.display')}</legend>
          {LAYER_KEYS.map((key) => (
            <label class="option" key={key}>
              <input
                type="checkbox"
                checked={settings.layers[key]}
                onChange={(e) => setLayer(key, e.currentTarget.checked)}
              />
              <span>{t(`settings.layer.${key}`)}</span>
            </label>
          ))}
          <label class="option">
            <input
              type="checkbox"
              checked={settings.showWeekNumbers}
              onChange={(e) => updateSettings({ showWeekNumbers: e.currentTarget.checked })}
            />
            <span>{t('settings.weekNumbers')}</span>
          </label>
        </fieldset>

        <fieldset>
          <legend>{t('settings.theme')}</legend>
          <div class="segmented">
            {THEMES.map((theme) => (
              <label key={theme}>
                <input
                  type="radio"
                  name="theme"
                  checked={settings.theme === theme}
                  onChange={() => updateSettings({ theme })}
                />
                <span>{t(`settings.theme.${theme}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <BackupSection />

        <p class="muted small">{t('settings.storageNote')}</p>
      </div>
    </dialog>
  );
}
