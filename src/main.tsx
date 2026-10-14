import { render } from 'preact';
import { App } from './app/App';
import { initEvents } from './app/events';
import { initInstall } from './app/install';
import { initTheme } from './app/theme';
import './styles/global.css';
import './styles/app.css';

initTheme();
initInstall();
void initEvents();

const root = document.getElementById('app');
if (root) render(<App />, root);
