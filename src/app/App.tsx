import { DayDetail } from '../components/DayDetail';
import { Legend } from '../components/Legend';
import { MonthGrid } from '../components/MonthGrid';
import { MonthHeader } from '../components/MonthHeader';
import { t } from '../i18n';

const REPO_URL = 'https://github.com/lcarwy/calendrier-cn-fr';

export function App() {
  return (
    <>
      <header class="app-header">
        <h1>{t('app.title')}</h1>
      </header>
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
    </>
  );
}
