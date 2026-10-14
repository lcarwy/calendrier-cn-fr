import { useRef } from 'preact/hooks';
import { DayDetail } from '../components/DayDetail';
import { EventEditor } from '../components/EventEditor';
import { InstallHint } from '../components/InstallHint';
import { Legend } from '../components/Legend';
import { MonthGrid } from '../components/MonthGrid';
import { MonthHeader } from '../components/MonthHeader';
import { SettingsDialog } from '../components/SettingsDialog';
import { InstallIcon, PlusIcon, SlidersIcon } from '../components/icons';
import { t } from '../i18n';
import { openNewEvent, storageError } from './events';
import { installPrompt, promptInstall } from './install';

const REPO_URL = 'https://github.com/lcarwy/calendrier-cn-fr';

export function App() {
  const settingsRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <header class="app-header">
        <h1>{t('app.title')}</h1>
        <div class="header-actions">
          {installPrompt.value && (
            <button
              type="button"
              class="header-button"
              aria-label={t('install.buttonLong')}
              onClick={() => void promptInstall()}
            >
              <InstallIcon />
              <span>{t('install.button')}</span>
            </button>
          )}
          <button
            type="button"
            class="header-button primary"
            aria-label={t('events.addLong')}
            onClick={() => openNewEvent()}
          >
            <PlusIcon />
            <span>{t('events.add')}</span>
          </button>
          <button
            type="button"
            class="header-button"
            aria-label={t('settings.open')}
            onClick={() => settingsRef.current?.showModal()}
          >
            <SlidersIcon />
            <span>{t('settings.open')}</span>
          </button>
        </div>
      </header>
      {storageError.value && (
        <p class="notice storage-error" role="alert">
          {t('events.storageError')}
        </p>
      )}
      <InstallHint />
      <main class="layout">
        <section class="calendar">
          <MonthHeader />
          <MonthGrid />
          <Legend />
        </section>
        <aside class="sidebar">
          <DayDetail />
        </aside>
      </main>
      <footer class="app-footer">
        <p>{t('footer.privacy')}</p>
        <p>
          <a href={`${REPO_URL}#sources-des-données`}>{t('footer.sources')}</a>
          {' · '}
          <a href={REPO_URL}>{t('footer.code')}</a>
        </p>
      </footer>
      <SettingsDialog dialogRef={settingsRef} />
      <EventEditor />
    </>
  );
}
